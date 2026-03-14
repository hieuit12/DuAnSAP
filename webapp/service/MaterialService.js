sap.ui.define([], function () {
	"use strict";

	return {
		getMaterials: function (oModel) {
			return new Promise(function (resolve, reject) {
				oModel.read("/MaterialSet", {
					success: function (oData) {
						resolve(oData.results);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
		},

		createMaterial: function (oModel, oPayload) {
			return new Promise(function (resolve, reject) {
				oModel.create("/MaterialSet", oPayload, {
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			});
		}
	};
});
