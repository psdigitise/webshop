import frappe
from erpnext.selling.doctype.quotation.quotation import Quotation

class CustomQuotation(Quotation):
    def has_permission(self, permtype=None):
        """Retain normal permission logic"""
        return super().has_permission(permtype)

def quotation_permission_query(user):
    """Filter quotations for list view based on company and docstatus"""
    if not user or user == "Administrator":
        return None

    user_company = frappe.db.get_value("User", user, "company")

    # If no company, show only user's own draft quotations
    if not user_company:
        return f"`tabQuotation`.`owner` = '{user}' AND `tabQuotation`.`docstatus` = 0"

    # Get all users under same company
    users_in_company = frappe.get_all(
        "User", filters={"company": user_company}, pluck="name"
    )

    if not users_in_company:
        return f"`tabQuotation`.`owner` = '{user}' AND `tabQuotation`.`docstatus` = 0"

    user_list = "', '".join(users_in_company)
    return f"`tabQuotation`.`owner` IN ('{user_list}') AND `tabQuotation`.`docstatus` = 0"

@frappe.whitelist()
def place_order_for_user(quotation_name):
    """Convert Quotation → Sales Order (for admin placing order on behalf of user)"""
    quotation = frappe.get_doc("Quotation", quotation_name)

    # Ensure it's draft
    if quotation.docstatus != 0:
        frappe.throw("Only draft quotations can be converted.")

    # Create Sales Order from Quotation
    sales_order = frappe.get_doc(quotation.make_sales_order())
    sales_order.flags.ignore_permissions = True
    sales_order.insert()
    sales_order.submit()

    # Optionally, trigger Payment Request automatically
    # payment_request = frappe.get_doc({
    #     "doctype": "Payment Request",
    #     "payment_gateway_account": "Cash",
    #     "party_type": "Customer",
    #     "party": sales_order.customer,
    #     "reference_doctype": "Sales Order",
    #     "reference_name": sales_order.name,
    #     "status": "Initiated"
    # }).insert(ignore_permissions=True)
    # payment_request.submit()

    return sales_order.name