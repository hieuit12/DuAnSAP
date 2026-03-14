sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"com/sap341/smartwarehouse/model/models",
	"com/sap341/smartwarehouse/service/MaterialService",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, models, MaterialService, MessageBox, MessageToast, Fragment, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("com.sap341.smartwarehouse.controller.MaterialList", {
		onInit: function () {
			var oComponent = this.getOwnerComponent();
			this._oModel = oComponent.getModel();

			// Initialize local models
			this.getView().setModel(models.createAppViewModel(), "appView");
			this.getView().setModel(models.createFormModel(), "formModel");
		},

		onRefresh: function () {
			this._oModel.refresh();
		},

		onSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			var aFilters = [];
			if (sQuery) {
				// ĐÂY LÀ CHÌA KHÓA: Ép chuỗi nhập vào thành CHỮ IN HOA
				sQuery = sQuery.toUpperCase();

				aFilters.push(new Filter("MaterialId", FilterOperator.Contains, sQuery));
			}
			var oTable = this.getView().byId("materialTable");
			var oBinding = oTable.getBinding("items");
			if (oBinding) {
				oBinding.filter(aFilters);
			}
		},

		onAddMaterial: function () {
			var oView = this.getView();
			var oFormModel = oView.getModel("formModel");

			// 1. Always clear OR init filtered list BEFORE update
			oFormModel.setProperty("/filteredSLocs", []);

			// 2. Initial defaults and population
			var sDefaultPlant = "DL21";
			var sDefaultSLoc = this._updateSLocAndDefault(sDefaultPlant);

			// 3. Reset form model with defaults
			oFormModel.setProperty("/materialForm", {
				MaterialId: "",
				MaterialName: "",
				MaterialType: "",
				BaseUnit: "",
				Plant: sDefaultPlant,
				StorageLocation: sDefaultSLoc
			});

			if (!this._oCreateDialog) {
				Fragment.load({
					id: oView.getId(),
					name: "com.sap341.smartwarehouse.fragment.MaterialCreateDialog",
					controller: this
				}).then(function (oDialog) {
					this._oCreateDialog = oDialog;
					oView.addDependent(this._oCreateDialog);
					this._oCreateDialog.open();
					// Explicitly call after open to ensure binding is active
					this._updateSLocAndDefault(sDefaultPlant);
				}.bind(this));
			} else {
				this._oCreateDialog.open();
				this._updateSLocAndDefault(sDefaultPlant);
			}
		},

		onSaveMaterial: function () {
			var oFormModel = this.getView().getModel("formModel");
			var oPayload = oFormModel.getProperty("/materialForm");

			if (!oPayload.MaterialId || !oPayload.MaterialName || !oPayload.MaterialType || !oPayload.BaseUnit || !oPayload.Plant || !oPayload.StorageLocation) {
				MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("msgValidation"));
				return;
			}

			this.getView().getModel("appView").setProperty("/busy", true);

			MaterialService.createMaterial(this._oModel, oPayload)
				.then(function () {
					MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("msgSuccess"));
					this._oCreateDialog.close();
					this.onRefresh();
				}.bind(this))
				.catch(function (oError) {
					var sMsg = oError.message || JSON.parse(oError.responseText).error.message.value;
					MessageBox.error(sMsg);
				})
				.finally(function () {
					this.getView().getModel("appView").setProperty("/busy", false);
				}.bind(this));
		},

		onCancelCreate: function () {
			this._oCreateDialog.close();
		},

		onChangePlant: function (oEvent) {
			var sSelectedPlant = oEvent.getSource().getSelectedKey();
			
			// Gọi hàm lọc mà không cần truyền ComboBox ID lằng nhằng nữa
			var sDefaultSLoc = this._updateSLocAndDefault(sSelectedPlant);
			
			// Nhớ đổi đường dẫn cho đúng form (materialForm hoặc goodsReceiptForm)
			this.getView().getModel("formModel").setProperty("/materialForm/StorageLocation", sDefaultSLoc);
			
			if (sSelectedPlant) {
				MessageToast.show("Đã chọn mặc định kho " + sDefaultSLoc + " cho " + sSelectedPlant);
			}
		},

		_updateSLocAndDefault: function (sPlant) {
			var oFormModel = this.getView().getModel("formModel");
			var aAllSLocs = oFormModel.getProperty("/storageLocations") || [];
			
			// Lọc ra danh sách kho mới theo nhà máy
			var aFilteredSLocs = aAllSLocs.filter(function (item) {
				return String(item.plant).trim() === String(sPlant).trim();
			});

			// Cập nhật model mảng riêng để UI ComboBox nó tự động cập nhật
			oFormModel.setProperty("/filteredSLocs", aFilteredSLocs);
			
			// Ép model refresh để chắc chắn UI nhận data mới
			oFormModel.refresh(true);
			
			// Trả về kho đầu tiên làm mặc định
			return aFilteredSLocs.length > 0 ? aFilteredSLocs[0].key : "";
		},

		onViewStock: function (oEvent) {
			var oItem = oEvent.getSource();
			var oContext = oItem.getBindingContext() || oItem.getParent().getBindingContext();
			var sMaterialId = oContext.getProperty("MaterialId");

			this.getOwnerComponent().getRouter().navTo("StockList", {
				query: {
					materialId: sMaterialId
				}
			});
		}
	});
});
