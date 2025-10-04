import frappe

def get_context(context):
    if frappe.session.user == "Guest":
        frappe.throw("You must be logged in to edit your profile", frappe.PermissionError)

    user = frappe.get_doc("User", frappe.session.user)
    context.user_doc = user.as_dict()
    return context
