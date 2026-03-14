sap.ui.define([], function () {
	"use strict";

	return {
		getStocks: function (oModel, aFilters) {
			return new Promise(function (resolve, reject) {
				oModel.read("/StockSet", {
					filters: aFilters || [],
					success: function (oData) {
						resolve(oData.results);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
		},

		updateStock: function (oModel, oPayload) {
			var sPath = oModel.createKey("/StockSet", {
				MaterialId: oPayload.MaterialId,
				Plant: oPayload.Plant,
				StorageLocation: oPayload.StorageLocation
			});

			return new Promise(function (resolve, reject) {
				oModel.update(sPath, oPayload, {
					success: function () {
						resolve();
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
		}
	};
});
