sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Item",
	"com/kanban/dash/ZRPE_KB_DASH2/utility/utilities",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"com/kanban/dash/ZRPE_KB_DASH2/model/formatter"
], function (Controller, Item, utilities, Filter, FilterOperator, JSONModel, formatter) {
	"use strict";

	return Controller.extend("com.kanban.dash.ZRPE_KB_DASH2.controller.dashboard", {
		formatter: formatter,
		
		onInit: function () {
			this.getKanbanOverViewModel();
			this.getControlCyleViewModel();
			this.getBasicInfo();
		},
		
		getBasicInfo: function(){
			this.getOwnerComponent().getModel().read("/BasicInfoSet", {
				success: function (oData, response) {
					if (oData.results.length > 0) {
						this.byId("plantText").setText(oData.results[0].Plant);
						this.byId("systemText").setText(oData.results[0].SystemID);
						this.byId("userText").setText(oData.results[0].UserName);
					}
				}.bind(this),
				error: function (oError) {
				}.bind(this)
			});
		},
		
		getControlCyleViewModel: function(){
			this.getOwnerComponent().getModel().read("/ControlCycleSet",{
				success:(oData)=>{
					let oCycleControl = new JSONModel(oData.results);
					this.getView().setModel(oCycleControl, "cycleControl");
				},
				error:(oData)=>{
					
				}
			});
		},
		
		getKanbanOverViewModel:function(){
			this.getOwnerComponent().getModel().read("/KanbanOverviewSet",{
				success:(oData) => {
					let oKanbanOverview = new JSONModel(oData.results);
					this.getView().setModel(oKanbanOverview, "kanbanList");
				},
				error:(error) =>{
					
				}
			});
		},
		
		supplyAreaFactory: function (sID, oContext) {
			var oItem;
			var oData = oContext.getObject();
			oItem = new Item({
				key: oData.SupplyAreaID,
				text: oData.SupplyAreaID + "--" + oData.SupplyAreaDesc
			});
			/**if (oData.SupplyAreaDefault === "X") {

				this.byId("supplyAreaFilter").addSelectedItem(oItem);
				this.search();
			}*/
			return oItem;
		},
		
		search: function () {
			this.byId("smartFilterBar").search(true);
		},

		onBeforeRebindTable: function (oEvent) {
			
			var mBindingParams = oEvent.getParameter("bindingParams");
			var aSelectedSAKeys = this.byId("supplyAreaFilter").getSelectedKeys();

			/*var aSelectedPLKeys = this.byId("produceFilter").getTokens(); //production line
			 */
			var aFilters = [];
			for (var i = 0; i < aSelectedSAKeys.length; i++) {
				aFilters.push(new Filter({
					path: "SupplyArea",
					operator: FilterOperator.EQ,
					value1: aSelectedSAKeys[i]
				}));
			}

			if (aFilters.length > 0) {
				this._addFilters(mBindingParams, aFilters);
			}
			//add Plant field request to select parameter
			//mBindingParams.parameters.select += ",Plant,ControlCycleID,MaterialNo,StoringPos";

			// if (!this.byId("controlCycleSmartTable").mEventRegistry.dataReceived) {
			// 	this.byId("controlCycleSmartTable").attachDataReceived(this.onTableDataReceived.bind(this));
			// }

		},

		onSmartTableInitialised: function (oEvent) {
			var oTable = oEvent.getSource().getTable();
			var aColumns = oTable.getColumns();
			var oColumnCustomData;
			var oResourceBundle = this.getResourceBundle();
			
			for (var i = 0; i < aColumns.length; i++) {
				oColumnCustomData = utilities.getColumnDataByColumn(aColumns[i]);
				switch (oColumnCustomData.columnKey) {
				case "SupplyArea":
					aColumns[i].setVisible(true);
					aColumns[i].getHeader().setText(oResourceBundle.getText("SupplyArea"));
					aColumns[i].setOrder(0);
					aColumns[i].setMinScreenWidth("Tablet");
					break;
				case "MaterialNo":
					aColumns[i].setVisible(true);
					// aColumns[i].getHeader().setText(oResourceBundle.getText("Material"));
					aColumns[i].setOrder(1);
					break;

				case "StatusOverview":
					aColumns[i].setVisible(true);
					aColumns[i].setOrder(2);
					break;
					
				case "FullNumCol":
					aColumns[i].setVisible(true);
					aColumns[i].setOrder(3);
					break;
					
				case "ActualQuantityCol":
					aColumns[i].setVisible(true);
					aColumns[i].setOrder(4);
					break;	
					
				default:
					aColumns[i].setVisible(false);
					break;
				}
			}
		},
		generateKanbanOverviewBar: function (sId, oContext) {

		},
		
		fnValueRoundDown: function(sValue){
			return Math.floor(sValue);
		},
		
		myFormatter: function(value) {
			return parseFloat(Math.round(value));
		},

		onTableDataReceived: function (data) {
			
			//this.byId("controlCycleTable").setShowOverlay(false);
			var aFilters = [];
			var oResults;
			var oEntitySet;
			if (data && data.getParameters().getParameters().data.results) {
				oResults = data.getParameters().getParameters().data.results;
			}
			// for (var i = 0; i < oResults.length; i++) {
			// 	aFilters.push(new Filter({
			// 		path: "SupplyArea",
			// 		operator: FilterOperator.EQ,
			// 		value1: oResults[i].SupplyAreaID
			// 	}));
			// }
			for (var i = 0; i < oResults.length; i++) {
				//oEntitySet = "/ControlCycleSet(SupplyAreaID='" + oResults[i].SupplyAreaID + "',MaterialNo='" + oResults[i].MaterialNo + "')";
				oEntitySet = "/ControlCycleSet('" + oResults[i].ControlCycleID + "')";
				this.getView().getModel().read(oEntitySet, {
					success: function (oData, response) {
						this.getView().setBusy(false);
					}.bind(this),
					error: function (oError) {
						this.getView().setBusy(false);
					}.bind(this),
					urlParameters: {
						"$expand": "CycleToStatus"
					}
				});
			}
		},
		_addFilters: function (mBindingParams, vFilters) {
			var aFilters = vFilters;
			if (!aFilters.length) {
				aFilters = [aFilters];
			}
			for (var i = 0; i < aFilters.length; i++) {
				var oFilter = aFilters[i];
				mBindingParams.filters.push(oFilter);
			}
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		
		onSupplyAreaSlecteionFinish: function () {
			this.search();
		},
		
		onSearchSupplyArea: function (){
			let aSupplyArea = this.getView().byId("supplyAreaFilter");
			let oBinding = this.getView().byId("controlCycleTable").getBinding("items");
			let aCycleControl = this.getView().getModel("cycleControl").getData();
			let aSupplyKeys = aSupplyArea.mProperties.selectedKeys;
			let aFilter = [];
			
			if(aSupplyKeys.length > 0){
				for(let index in aSupplyKeys){
					aCycleControl.map((item)=>{
						if(item.SupplyArea === aSupplyKeys[index]){
							aFilter.push(new Filter("MaterialNo", FilterOperator.Contains, item.MaterialNo));
						}
					});
				}
			}

			oBinding.filter(aFilter);
		},
		
		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Fiori Launchpad home page.
		 * @public
		 */
		onNavBack: function () {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Navigate back to FLP home
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#"
					}
				});
			}
		}
	});
});