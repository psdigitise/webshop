import frappe
from frappe.contacts.doctype.address.address import get_address_display

def get_context(context):
    user = frappe.session.user
    context.user_doc = frappe.get_doc("User", user)

    addresses = frappe.get_all("Address", filters={"owner": user}, fields=["*"])
    
    final_addresses = []

    for a in addresses:
        addr = frappe.get_doc("Address", a.name)
        addr.display = get_address_display(addr.as_dict())  # formatted text
        final_addresses.append(addr)

    context.shipping_addresses = [
        a for a in final_addresses if a.address_type == "Shipping"
    ]

    context.billing_addresses = [
        a for a in final_addresses if a.address_type == "Billing"
    ]

    context.addresses = final_addresses
    
    return context
