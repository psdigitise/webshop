import frappe


def sales_order_permission_query(user):
    """Filter Sales Orders in list view based on user's company"""
    if not user or user == "Administrator":
        return None

    user_company = frappe.db.get_value("User", user, "company")

    # If no company, restrict to own Sales Orders
    if not user_company:
        return f"`tabSales Order`.`owner` = '{user}'"

    # Get all users under same company
    users_in_company = frappe.get_all(
        "User", filters={"company": user_company}, pluck="name"
    )

    if not users_in_company:
        return f"`tabSales Order`.`owner` = '{user}'"

    user_list = "', '".join(users_in_company)

    # Show all Sales Orders created by users of this company
    return f"`tabSales Order`.`owner` IN ('{user_list}')"