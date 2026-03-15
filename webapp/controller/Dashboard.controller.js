sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
	"use strict";

	return Controller.extend("com.sap341.smartwarehouse.controller.Dashboard", {
		onInit: function () {
			this.getView().bindElement("/DashboardKPISet('1')");
		},

		onNavToMaterials: function () {
			UIComponent.getRouterFor(this).navTo("MaterialList");
		},

		onNavToStock: function () {
			UIComponent.getRouterFor(this).navTo("StockList");
		},

		onNavToHistory: function () {
			UIComponent.getRouterFor(this).navTo("History");
		}
	});
});
