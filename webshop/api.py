import frappe
from erpnext.selling.doctype.quotation.quotation import _make_sales_order
from urllib.parse import urlencode


@frappe.whitelist(allow_guest=True)
def search_item_groups_with_route(txt):
    return frappe.get_all(
        "Website Item",
        filters={
            "web_item_name": ["like", f"%{txt}%"],
            "published": 1
        },
        fields=["web_item_name", "route","thumbnail"],
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
    if "Sales Manager" not in frappe.get_roles(frappe.session.user):
        frappe.throw("Not permitted")

    quotation = frappe.get_doc("Quotation", quotation_name)
    if quotation.docstatus != 1:
        quotation.submit()
        
    so = _make_sales_order(quotation_name)
    from frappe.utils import nowdate
    so.posting_date = nowdate()
    if so.get("payment_schedule"):
        for term in so.payment_schedule:
            term.due_date = nowdate()

    so.flags.ignore_permissions = True
    so.insert(ignore_permissions=True)
    so.submit()

    frappe.msgprint(f"Sales Order {so.name} submitted successfully.")

    return f"Sales Order {so.name} submitted successfully."


@frappe.whitelist()
def get_stripe_redirect_url(sales_order):
    """Generate dynamic Stripe checkout URL from Sales Order"""
    so = frappe.get_doc("Sales Order", sales_order)

    amount = so.grand_total
    title = so.title or so.name
    description = f"Payment Request for {so.name}"
    reference_doctype = "Sales Order"
    reference_docname = so.name
    payer_email = frappe.session.user
    payer_name = so.customer
    order_id = so.name
    currency = so.currency or "GBP"
    payment_gateway = "Stripe"

    params = {
        "amount": amount,
        "title": title,
        "description": description,
        "reference_doctype": reference_doctype,
        "reference_docname": reference_docname,
        "payer_email": payer_email,
        "payer_name": payer_name,
        "order_id": order_id,
        "currency": currency,
        "payment_gateway": payment_gateway,
    }

    base_url = "http://192.168.1.23:8000/stripe_checkout"
    return f"{base_url}?{urlencode(params)}"

@frappe.whitelist(allow_guest=True)
def get_top_rated_items(limit=6):
    return frappe.get_all('Website Item',
        fields=['name', 'web_item_name', 'thumbnail', 'average_rating','route','website_image'],
        filters={'published': 1},
        order_by='average_rating desc',
        limit=limit
    )

@frappe.whitelist(allow_guest=True)
def get_random_products(limit=10):
    items = frappe.get_all(
        "Website Item",
        fields=[
            "name",
            "web_item_name",
            "thumbnail",
            "average_rating",
            "route",
            "item_code",
            "website_image"
        ],
        filters={"published": 1},
        order_by="RAND()",
        limit=limit
    )

    for item in items:
        price = frappe.db.get_value(
            "Item Price",
            {"item_code": item.item_code, "selling": 1},
            "price_list_rate"
        )

        item["price"] = price or 0

    return items
# dc45c90cb2cd813    
# 761fa577fbe0b23