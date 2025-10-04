import frappe
from frappe.utils import get_url

from erpnext.accounts.doctype.payment_request.payment_request import (
    PaymentRequest as OriginalPaymentRequest,
)
from erpnext.accounts.doctype.payment_entry.payment_entry import get_payment_entry
from frappe.utils import nowdate, flt
from erpnext.accounts.utils import get_account_currency
from erpnext.accounts.party import get_party_account
from erpnext import get_default_cost_center
from erpnext.accounts.doctype.accounting_dimension.accounting_dimension import get_accounting_dimensions


class PaymentRequest(OriginalPaymentRequest):
    def on_payment_authorized(self, status=None):
        if not status:
            return

        if status not in ("Authorized", "Completed"):
            return

        if not hasattr(frappe.local, "session"):
            return

        if frappe.local.session.user == "Guest":
            return

        cart_settings = frappe.get_doc("Webshop Settings")

        if not cart_settings.enabled:
            return

        success_url = cart_settings.payment_success_url
        redirect_to = get_url("/orders/{0}".format(self.reference_name))

        if success_url:
            redirect_to = (
                {
                    "Orders": "/orders",
                    "Invoices": "/invoices",
                    "My Account": "/me",
                }
            ).get(success_url, "/me")

        original_user = frappe.session.user
        try:
            frappe.set_user("Administrator")
            self.set_as_paid()
        finally:
            frappe.set_user(original_user)


        return redirect_to

    @staticmethod
    def get_gateway_details(args):
        if args.order_type != "Shopping Cart":
            return super().get_gateway_details(args)

        cart_settings = frappe.get_doc("Webshop Settings")
        gateway_account = cart_settings.payment_gateway_account
        return super().get_payment_gateway_account(gateway_account)

    def create_payment_entry(self, submit=True):
        frappe.flags.ignore_account_permission = True

        ref_doc = frappe.get_doc(self.reference_doctype, self.reference_name)

        if self.reference_doctype in ["Sales Invoice", "POS Invoice"]:
            party_account = ref_doc.debit_to
        elif self.reference_doctype == "Purchase Invoice":
            party_account = ref_doc.credit_to
        else:
            party_account = get_party_account("Customer", ref_doc.get("customer"), ref_doc.company)

        party_account_currency = (
            self.get("party_account_currency")
            or ref_doc.get("party_account_currency")
            or get_account_currency(party_account)
        )

        party_amount = bank_amount = self.outstanding_amount

        if party_account_currency == ref_doc.company_currency and party_account_currency != self.currency:
            exchange_rate = ref_doc.get("conversion_rate")
            bank_amount = flt(self.outstanding_amount / exchange_rate, self.precision("grand_total"))

        payment_entry = get_payment_entry(
            self.reference_doctype,
            self.reference_name,
            party_amount=party_amount,
            bank_account=self.payment_account,
            bank_amount=bank_amount,
            created_from_payment_request=True,
        )

        default_cost_center = get_default_cost_center(self.company)
        payment_entry.update({
            "mode_of_payment": self.mode_of_payment,
            "reference_no": self.name,
            "reference_date": nowdate(),
            "remarks": f"Payment Entry against {self.reference_doctype} {self.reference_name} via Payment Request {self.name}",
            "cost_center": self.get("cost_center") or default_cost_center,
            "project": self.get("project"),
        })

        self._allocate_payment_request_to_pe_references(references=payment_entry.references)

        if self.currency != ref_doc.company_currency:
            if (
                self.payment_request_type == "Outward"
                and payment_entry.paid_from_account_currency == ref_doc.company_currency
                and payment_entry.paid_from_account_currency != payment_entry.paid_to_account_currency
            ):
                payment_entry.paid_amount = payment_entry.base_paid_amount = (
                    payment_entry.target_exchange_rate * payment_entry.received_amount
                )

        for dimension in get_accounting_dimensions():
            payment_entry.update({dimension: self.get(dimension)})

        if submit:
            payment_entry.insert(ignore_permissions=True)
            payment_entry.submit()

        return payment_entry