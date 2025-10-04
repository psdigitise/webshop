import frappe
from erpnext.selling.doctype.quotation.quotation import _make_sales_order



@frappe.whitelist(allow_guest=True)
def search_item_groups_with_route(txt):
    return frappe.get_all(
        "Item Group",
        filters={
            "item_group_name": ["like", f"%{txt}%"],
            "parent_item_group": "Custom"
        },
        fields=["item_group_name", "route"],
        limit_page_length=5
    )


@frappe.whitelist()
def get_cart_list():
    if "Cart Manager" not in frappe.get_roles(frappe.session.user):
        frappe.throw("Not permitted")

    return frappe.get_all(
        "Quotation",
        filters={"docstatus": 0},
        fields=["name", "owner", "party_name", "grand_total"],
        order_by="modified desc",
        limit_page_length=10
    )


@frappe.whitelist()
def place_order_from_cart(quotation_name):
    if "Cart Manager" not in frappe.get_roles(frappe.session.user):
        frappe.throw("Not permitted")

    quotation = frappe.get_doc("Quotation", quotation_name)
    if quotation.docstatus != 1:
        quotation.submit()
        
    so = _make_sales_order(quotation_name)
    so.insert(ignore_permissions=True)
    so.submit()

    frappe.msgprint(f"Sales Order {so.name} submitted successfully.")

    return f"Sales Order {so.name} submitted successfully."

@frappe.whitelist(allow_guest=True)
def get_top_rated_items(limit=5):
    return frappe.get_all('Website Item',
        fields=['name', 'web_item_name', 'thumbnail', 'average_rating','route'],
        filters={'published': 1},
        order_by='average_rating desc',
        limit=limit
    )

# dc45c90cb2cd813    
# 761fa577fbe0b23