sap.ui.define([], function () {
	"use strict";

	return {
		postGoodsReceipt: function (oModel, oPayload) {
			return new Promise(function (resolve, reject) {
				oModel.create("/GoodsReceiptSet", oPayload, {
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
