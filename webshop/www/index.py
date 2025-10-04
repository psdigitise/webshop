import frappe
from frappe import _

sitemap = 1


# def get_context(context):
# 	context.body_class = "product-page"
# 	context.parents = [{"name": frappe._("Home"), "route": "/"}]

# 	settings = frappe.get_cached_doc("Webshop Settings")
# 	context.categories_enabled = settings.enable_field_filters

# 	if context.categories_enabled:
# 		categories = [row.fieldname for row in settings.filter_fields]
# 		context.tabs = get_tabs(categories)

# 	if settings.slideshow:
# 		context.slideshow = get_slideshow(settings.slideshow)
#       # Add homepage as parent
#     # context.body_class = "product-page"
    

#     # ✅ Directly fetch Website Items for homepage product grid
# 	context.products = frappe.get_all(
# 		"Website Item",
# 		filters={"published": 1},
# 		fields=["name", "item_name", "website_image", "route", "description"],
# 		limit_page_length=4
# 	)

# 	context.no_cache = 1
# 	sitemap = 1

# 	# context.no_cache = 1


# def get_context(context):
#     context.body_class = "product-page"
#     context.parents = [{"name": frappe._("Home"), "route": "/"}]

#     settings = frappe.get_cached_doc("Webshop Settings")
#     context.categories_enabled = settings.enable_field_filters

#     if settings.slideshow:
#         context.slideshow = get_slideshow(settings.slideshow)

#     # ✅ Detect correct field for website publishing
#     website_item_meta = frappe.get_meta("Website Item")
#     if website_item_meta.get_field("show_in_website"):
#         filters = {"show_in_website": 1}
#     elif website_item_meta.get_field("published_in_website"):
#         filters = {"published_in_website": 1}
#     elif website_item_meta.get_field("published"):
#         filters = {"published": 1}
#     else:
#         filters = {}

#     context.products = frappe.get_all(
#         "Website Item",
#         filters=filters,
#         fields=["name", "item_name", "website_image", "route", "description"],
#         limit_page_length=4
#     )

#     context.no_cache = 1


sitemap = 1

def get_context(context):
    context.body_class = "product-page"
    context.parents = [{"name": frappe._("Home"), "route": "/"}]

    settings = frappe.get_cached_doc("Webshop Settings")
    context.categories_enabled = settings.enable_field_filters

    # ✅ Slideshow
    if settings.slideshow:
        context.slideshow = get_slideshow(settings.slideshow)

    # ✅ Detect correct field for website publishing (for products)
    website_item_meta = frappe.get_meta("Website Item")
    if website_item_meta.get_field("show_in_website"):
        filters = {"show_in_website": 1}
    elif website_item_meta.get_field("published_in_website"):
        filters = {"published_in_website": 1}
    elif website_item_meta.get_field("published"):
        filters = {"published": 1}
    else:
        filters = {}

    # ✅ Homepage Product Grid
    context.products = frappe.get_all(
        "Website Item",
        filters=filters,
        fields=["name", "item_name", "website_image", "route", "description"],
        limit_page_length=4
    )

    # ✅ Navbar Categories (Item Groups)
    context.nav_categories = frappe.get_all(
        "Item Group",
        filters={"show_in_website": 1, "is_group": 0},  # leaf categories only
        # fields=["name", "route"],
        fields=["name", "is_group", "show_in_website", "route"],
        order_by="name asc"
    )

    context.no_cache = 1
    return context


def get_slideshow(slideshow):
    values = {"show_indicators": 1, "show_controls": 1, "rounded": 1, "slider_name": "Categories"}
    slideshow = frappe.get_cached_doc("Website Slideshow", slideshow)
    slides = slideshow.get({"doctype": "Website Slideshow Item"})
    for index, slide in enumerate(slides, start=1):
        values[f"slide_{index}_image"] = slide.image
        values[f"slide_{index}_title"] = slide.heading
        values[f"slide_{index}_subtitle"] = slide.description
        values[f"slide_{index}_theme"] = slide.get("theme") or "Light"
        values[f"slide_{index}_content_align"] = slide.get("content_align") or "Centre"
        values[f"slide_{index}_primary_action"] = slide.url
    return values


def get_slideshow(slideshow):
	values = {"show_indicators": 1, "show_controls": 1, "rounded": 1, "slider_name": "Categories"}
	slideshow = frappe.get_cached_doc("Website Slideshow", slideshow)
	slides = slideshow.get({"doctype": "Website Slideshow Item"})
	for index, slide in enumerate(slides, start=1):
		values[f"slide_{index}_image"] = slide.image
		values[f"slide_{index}_title"] = slide.heading
		values[f"slide_{index}_subtitle"] = slide.description
		values[f"slide_{index}_theme"] = slide.get("theme") or "Light"
		values[f"slide_{index}_content_align"] = slide.get("content_align") or "Centre"
		values[f"slide_{index}_primary_action"] = slide.url

	return values


def get_tabs(categories):
	tab_values = {
		"title": _("Shop by Category"),
	}

	categorical_data = get_category_records(categories)
	for index, tab in enumerate(categorical_data, start=1):
		tab_values[f"tab_{index + 1}_title"] = frappe.unscrub(tab)
		# pre-render cards for each tab
		tab_values[f"tab_{index + 1}_content"] = frappe.render_template(
			"webshop/www/shop-by-category/category_card_section.html",
			{"data": categorical_data[tab], "type": tab},
		)
	return tab_values


def get_category_records(categories):
	categorical_data = {}
	website_item_meta = frappe.get_meta("Website Item", cached=True)

	for category in categories:
		if category == "item_group":
			categorical_data["item_group"] = frappe.db.get_all(
				"Item Group",
				filters={"show_in_website": 1},
				fields=["name", "parent_item_group", "is_group", "image", "route"],
			)
		else:
			field_type = website_item_meta.get_field(category).fieldtype

			if field_type == "Table MultiSelect":
				child_doc = website_item_meta.get_field(category).options
				for field in frappe.get_meta(child_doc, cached=True).fields:
					if field.fieldtype == "Link" and field.reqd:
						doctype = field.options
			else:
				doctype = website_item_meta.get_field(category).options

			fields = ["name"]

			meta = frappe.get_meta(doctype, cached=True)
			if meta.get_field("image"):
				fields += ["image"]

			filters = {}
			if meta.get_field("show_in_website"):
				filters = {"show_in_website": 1}

			elif meta.get_field("custom_show_in_website"):
				filters = {"custom_show_in_website": 1}

			try:
				if filters:
					categorical_data[category] = frappe.db.get_all(doctype, fields=fields, filters=filters)
				else:
					categorical_data[category] = frappe.db.get_all(doctype, fields=fields)

			except BaseException:
				frappe.throw(_("DocType {} not found").format(doctype))

	return categorical_data




# def get_context(context):
