import frappe


def sales_order_permission_query(user):
    """Filter Sales Orders in list view based on user's company and workflow state."""
    if not user or user == "Administrator":
        return None

    user_roles = frappe.get_roles(user)

    if "Level 1 Admin" in user_roles:
        return "`tabSales Order`.`workflow_state` = 'Pending L1 Approval'"

    if "Level 2 Admin" in user_roles:
        return "`tabSales Order`.`workflow_state` = 'Pending L2 Approval'"

    user_company = frappe.db.get_value("User", user, "company")

    if not user_company:
        return f"`tabSales Order`.`owner` = '{user}'"

    users_in_company = frappe.get_all(
        "User", filters={"company": user_company}, pluck="name"
    )

    if not users_in_company:
        return f"`tabSales Order`.`owner` = '{user}'"

    user_list = "', '".join(users_in_company)
    return f"`tabSales Order`.`owner` IN ('{user_list}')"
