import frappe

@frappe.whitelist(allow_guest=False)
def get_web_user_dashboard():
    """Return dashboard data based on current user's role."""
    user = frappe.session.user
    if user == "Guest":
        return {"error": "Login required"}

    frappe.logger().info(f"Dashboard call for user: {user}")

    roles = frappe.get_roles(user)
    user_doc = frappe.get_doc("User", user)
    customer = frappe.db.get_value("Portal User", {"user": user_doc.email}, "parent")

    data = {"role": None, "orders": [], "pending_approvals": []}

    if "Retail Buyer" in roles:
        data["role"] = "Retail Buyer"
        if customer:
            data["orders"] = frappe.get_all(
                "Sales Order",
                filters={"customer": customer},
                fields=["name", "status", "workflow_state", "transaction_date", "grand_total"]
            )

    elif "Corporate Buyer" in roles:
        data["role"] = "Corporate Buyer"
        if customer:
            data["orders"] = frappe.get_all(
                "Sales Order",
                filters={"customer": customer},
                fields=["name", "status", "workflow_state", "transaction_date", "grand_total"]
            )

    elif "Level 1 Admin" in roles:
        data["role"] = "Level 1 Admin"
        data["pending_approvals"] = frappe.get_all(
            "Sales Order",
            filters={"workflow_state": "Pending L1 Approval"},
            fields=["name", "customer_name", "grand_total", "workflow_state"]
        )

    elif "Level 2 Admin" in roles:
        data["role"] = "Level 2 Admin"
        data["pending_approvals"] = frappe.get_all(
            "Sales Order",
            filters={"workflow_state": "Pending L2 Approval"},
            fields=["name", "customer_name", "grand_total", "workflow_state"]
        )

    else:
        data["role"] = "Unknown"

    for v in data.values():
        if isinstance(v, list):
            for row in v:
                for k in list(row.keys()):
                    if row[k] is None:
                        row[k] = ""

    return data
