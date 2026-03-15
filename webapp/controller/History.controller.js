sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../model/formatter"
], function (Controller, Filter, FilterOperator, formatter) {
	"use strict";

	return Controller.extend("com.sap341.smartwarehouse.controller.History", {
		formatter: formatter,

		onInit: function () {
		},

		onSearch: function () {
			var aFilters = [];
			var sMaterialId = this.byId("filterMaterial").getValue();
			var sPlantId = this.byId("filterPlant").getSelectedKey();
			var sStorageLocationId = this.byId("filterStorageLocation").getSelectedKey();

			if (sMaterialId) {
				aFilters.push(new Filter("MaterialId", FilterOperator.Contains, sMaterialId));
			}
			if (sPlantId) {
				aFilters.push(new Filter("Plant", FilterOperator.EQ, sPlantId));
			}
			if (sStorageLocationId) {
				aFilters.push(new Filter("StorageLocation", FilterOperator.EQ, sStorageLocationId));
			}

			var oTable = this.byId("historyTable");
			var oBinding = oTable.getBinding("items");
			if (oBinding) {
				oBinding.filter(aFilters);
			}
		},

		onPlantChange: function (oEvent) {
			var sPlantId = oEvent.getSource().getSelectedKey();
			var oSlocComboBox = this.byId("filterStorageLocation");
			var oBinding = oSlocComboBox.getBinding("items");

			if (oSlocComboBox && oBinding) {
				var aFilters = [];
				if (sPlantId) {
					aFilters.push(new Filter("PlantId", FilterOperator.EQ, sPlantId));
				}
				oBinding.filter(aFilters);
				oSlocComboBox.setEnabled(!!sPlantId);
			}
		},

		onReset: function () {
			this.byId("filterMaterial").setValue("");
			this.byId("filterPlant").setSelectedKey("");
			this.byId("filterStorageLocation").setSelectedKey("");
			this.byId("filterStorageLocation").getBinding("items").filter([]);
			this.onSearch();
		},

		onRefresh: function () {
			this.getView().byId("historyTable").getBinding("items").refresh();
		}
	});
});
