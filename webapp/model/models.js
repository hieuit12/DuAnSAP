sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createAppViewModel: function () {
			return new JSONModel({
				busy: false,
				delay: 0,
				title: "Smart Warehouse"
			});
		},

		createFilterModel: function () {
			return new JSONModel({
				materialId: "",
				materialType: "",
				plant: "",
				storageLocation: ""
			});
		},

		createFormModel: function () {
			return new JSONModel({
				materialForm: {
					MaterialId: "",
					MaterialName: "",
					MaterialType: "",
					BaseUnit: "",
					Plant: "",
					StorageLocation: ""
				},
				stockForm: {
					MaterialId: "",
					Plant: "",
					StorageLocation: "",
					Quantity: 0
				},
				goodsReceiptForm: {
					MaterialId: "",
					Plant: "",
					StorageLocation: "",
					Quantity: 0,
					PostingDate: new Date(),
					DocumentDate: new Date(),
					Remark: ""
				},
				storageLocations: [
					{ key: "FG10", text: "FG10 - Finished Goods DL", plant: "DL21" },
					{ key: "RM10", text: "RM10 - Raw Materials DL", plant: "DL21" },
					{ key: "TG10", text: "TG10 - Trading Goods DL", plant: "DL21" },
					{ key: "FG00", text: "FG00 - Finished Goods", plant: "DL00" },
					{ key: "MI00", text: "MI00 - Miscellaneous", plant: "DL00" },
					{ key: "RE00", text: "RE00 - Returns", plant: "DL00" },
					{ key: "RM00", text: "RM00 - Raw Materials", plant: "DL00" },
					{ key: "SF00", text: "SF00 - Semi-Fin. Goods", plant: "DL00" },
					{ key: "FG11", text: "FG11 - 11 Fin. Goods", plant: "DL11" },
					{ key: "MI11", text: "MI11 - 11 Misc. Goods", plant: "DL11" },
					{ key: "RM11", text: "RM11 - 11 Raw Materials", plant: "DL11" },
					{ key: "SF11", text: "SF11 - 11 Semi-Finished", plant: "DL11" }
				],
				filteredSLocs: []
			});
		}
	};
});