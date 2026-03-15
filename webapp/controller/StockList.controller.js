sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/sap341/smartwarehouse/model/models",
	"com/sap341/smartwarehouse/service/StockService",
	"com/sap341/smartwarehouse/service/GoodsReceiptService",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/routing/History"
], function (Controller, models, StockService, GoodsReceiptService, MessageBox, MessageToast, Fragment, Filter, FilterOperator, History) {
	"use strict";

	return Controller.extend("com.sap341.smartwarehouse.controller.StockList", {
		onInit: function () {
			var oComponent = this.getOwnerComponent();
			this._oModel = oComponent.getModel();
			this._oRouter = oComponent.getRouter();

			this.getView().setModel(models.createAppViewModel(), "appView");
			this.getView().setModel(models.createFormModel(), "formModel");

			this._oRouter.getRoute("StockList").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function (oEvent) {
			var oArgs = oEvent.getParameter("arguments");
			var oQuery = oArgs["?query"];
			if (oQuery && oQuery.materialId) {
				this.getView().byId("searchStockField").setValue(oQuery.materialId);
				this._applyFilter(oQuery.materialId);
			} else {
				this._applyFilter("");
			}
		},

		onRefresh: function () {
			this._oModel.refresh();
		},

		onSearchStock: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._applyFilter(sQuery);
		},

		_applyFilter: function (sQuery) {
			var aFilters = [];
			if (sQuery) {
				// ĐÂY LÀ CHÌA KHÓA: Ép chuỗi nhập vào thành CHỮ IN HOA
				sQuery = sQuery.toUpperCase();

				aFilters.push(new Filter("MaterialId", FilterOperator.Contains, sQuery));
			}
			var oTable = this.getView().byId("stockTable");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);
		},
		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this._oRouter.navTo("MaterialList", {}, true);
			}
		},

		onUpdateStock: function (oEvent) {
			var oItem = oEvent.getSource();
			var oContext = oItem.getBindingContext();
			var oData = oContext.getObject();

			var oFormModel = this.getView().getModel("formModel");
			oFormModel.setProperty("/stockForm", Object.assign({}, oData));

			var oView = this.getView();
			if (!this._oUpdateDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "com.sap341.smartwarehouse.fragment.UpdateStockDialog",
					controller: this
				}).then(function (oDialog) {
					this._oUpdateDialog = oDialog;
					oView.addDependent(this._oUpdateDialog);
					this._oUpdateDialog.open();
				}.bind(this));
			} else {
				this._oUpdateDialog.open();
			}
		},

		onConfirmUpdateStock: function () {
			var oFormModel = this.getView().getModel("formModel");
			var oData = oFormModel.getProperty("/stockForm");

			if (oData.Quantity < 0) {
				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("msgInvalidQuantity"));
				return;
			}

			this.getView().getModel("appView").setProperty("/busy", true);

			// Clean payload and ensure types for OData V2 Decimal
			var oPayload = {
				MaterialId: oData.MaterialId,
				Plant: oData.Plant,
				StorageLocation: oData.StorageLocation,
				Quantity: String(oData.Quantity),
				BaseUnit: oData.BaseUnit,
				MaterialName: oData.MaterialName
			};

			StockService.updateStock(this._oModel, oPayload)
				.then(function () {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("msgSuccess"));
					this._oUpdateDialog.close();
					this.onRefresh();
				}.bind(this))
				.catch(function (oError) {
					var sMsg = "";
					try {
						var oResponse = JSON.parse(oError.responseText);
						sMsg = oResponse.error.message.value;
					} catch (e) {
						sMsg = oError.message || oError.statusText || "HTTP Request Failed";
					}
					MessageBox.error(sMsg);
				}.bind(this))
				.finally(function () {
					this.getView().getModel("appView").setProperty("/busy", false);
				}.bind(this));
		},

		onCancelUpdateStock: function () {
			this._oUpdateDialog.close();
		},
		onGoodsReceipt: function () {
			var oView = this.getView();
			var oFormModel = oView.getModel("formModel");
			
			// 1. Initial defaults
			oFormModel.setProperty("/goodsReceiptForm", {
				MaterialId: "",
				Plant: "",
				StorageLocation: "",
				Quantity: 0,
				PostingDate: new Date(),
				DocumentDate: new Date(),
				Remark: ""
			});

			if (!this._oGRDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "com.sap341.smartwarehouse.fragment.GoodsReceiptDialog",
					controller: this
				}).then(function (oDialog) {
					this._oGRDialog = oDialog;
					oView.addDependent(this._oGRDialog);
					this._oGRDialog.open();
					
					// Apply initial filtering (dấu kho đi)
					this._updateSLocAndDefault("");
				}.bind(this));
			} else {
				this._oGRDialog.open();
				this._updateSLocAndDefault("");
			}
		},

		onConfirmGoodsReceipt: function () {
			var oFormModel = this.getView().getModel("formModel");
			var oData = oFormModel.getProperty("/goodsReceiptForm");

			if (!oData.MaterialId || !oData.Plant || !oData.StorageLocation || oData.Quantity <= 0) {
				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("msgValidation"));
				return;
			}

			this.getView().getModel("appView").setProperty("/busy", true);

			// Clean payload and ensure types for OData V2
			var oPayload = {
				MaterialId: oData.MaterialId,
				Plant: oData.Plant,
				StorageLocation: oData.StorageLocation,
				Quantity: String(oData.Quantity),
				PostingDate: oData.PostingDate instanceof Date ? oData.PostingDate : new Date(oData.PostingDate),
				DocumentDate: oData.DocumentDate instanceof Date ? oData.DocumentDate : new Date(oData.DocumentDate),
				Remark: oData.Remark || ""
			};

			GoodsReceiptService.postGoodsReceipt(this._oModel, oPayload)
				.then(function (oDataResponse) {
					var sMsg = this.getView().getModel("i18n").getResourceBundle().getText("msgSuccess");
					if (oDataResponse.MaterialDocument) {
						sMsg += " (Doc: " + oDataResponse.MaterialDocument + ")";
					}
					MessageBox.success(sMsg);
					this._oGRDialog.close();
					this.onRefresh();
				}.bind(this))
				.catch(function (oError) {
					var sMsg = "";
					try {
						var oResponse = JSON.parse(oError.responseText);
						sMsg = oResponse.error.message.value;
					} catch (e) {
						sMsg = oError.message || oError.statusText || "HTTP Request Failed";
					}
					MessageBox.error(sMsg);
				}.bind(this))
				.finally(function () {
					this.getView().getModel("appView").setProperty("/busy", false);
				}.bind(this));
		},

		onCancelGoodsReceipt: function () {
			this._oGRDialog.close();
		},

		onChangePlant: function (oEvent) {
			var sSelectedPlant = oEvent.getSource().getSelectedKey();
			this._updateSLocAndDefault(sSelectedPlant);
		},

		_updateSLocAndDefault: function (sPlant) {
			var oSlocComboBox = this.byId("grSLocComboBox");
			if (!oSlocComboBox) {
				return;
			}
			
			var oBinding = oSlocComboBox.getBinding("items");
			var aFilters = [];
			
			if (sPlant) {
				aFilters.push(new Filter("PlantId", FilterOperator.EQ, sPlant));
			}
			
			if (oBinding) {
				oBinding.filter(aFilters);
			}
		}
	});
});
