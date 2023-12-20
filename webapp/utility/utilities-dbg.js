sap.ui.define([
	"sap/m/Text",
	"sap/m/MessageBox"
	// "pg/kanban/microbarresources/sap/suite/ui/microchart/StackedBarMicroChartBar"
], function(Text, MessageBox/*, StackedBarMicroChartBar*/) {
	"use strict";
	return {
		getMessageStrip: function(iNum, sStatus) {
			var oText = new Text({
				text: iNum,
				wrapping: false
			}).addStyleClass("baseMessageStrip");
			switch (sStatus) {
				case "1":
					oText.addStyleClass("waitMessageStrip");
					break;
				case "2":
					oText.addStyleClass("emptyMessageStrip");
					break;
				case "3":
					oText.addStyleClass("missingMessageStrip");
					break;
				case "4":
					oText.addStyleClass("processMessageStrip");
					break;
				case "5":
					oText.addStyleClass("fullMessageStrip");
					break;
				case "6":
					oText.addStyleClass("inuseMessageStrip");
					break;
				case "X"://lock
					oText.removeStyleClass("baseMessageStrip");
					oText.addStyleClass("lockMessageStrip");
					break;
			}
			return oText;
		},
		
		showErrorMessage: function(sErrorText, oContext) {
			MessageBox.show(sErrorText, {
				icon: sap.m.MessageBox.Icon.ERROR,
				title: oContext.getResourceBundle().getText("errorTitle")
			});
		},
		
		generateWalkthrough: function(oContext) {
			// $(function() {
			if($('body').pagewalkthrough){
				$('body').pagewalkthrough({
					name: 'introduction',
					steps: [{
						popup: {
							content: '#walkthrough-1',
							type: 'modal'
						}
					}, {
						wrapper: "#" + oContext.byId("smartFilterBar").getId(),
						popup: {
							content: '#walkthrough-2',
							type: 'tooltip',
							position: 'bottom'
						}
					}, {
						wrapper: "#" + oContext.byId("controlCycleTable").getId(),
						popup: {
							content: '#walkthrough-3',
							type: 'tooltip',
							position: 'top'
						}
					}]
				});
				$('body').pagewalkthrough('show');
			// });
			}
		},
		
		getColumnDataByColumn: function(oColumn) {
			var aCustomData = oColumn.getAggregation("customData");
			var oCustomData;
			for (var i = 0; i < aCustomData.length; i++) {
				if (aCustomData[i].getProperty("key") === "p13nData") {
					oCustomData = aCustomData[i].getProperty("value");
					break;
				}
			}
			return oCustomData;
		},
		
		/**
		 * Shows a {@link sap.m.MessageBox} when a service call has failed.
		 * Only the first error message will be display.
		 * @param {string} sDetails a technical error to be displayed on request
		 * @public
		 */
		showServiceError: function(oEvent, oComponent){
			var oParams = oEvent.getParameters();
			if(oParams.statusCode === 400){
				var xmlDoc = this.parseXML(oParams.responseText);
				MessageBox.show(
					xmlDoc.getElementsByTagName("message")[0].firstChild.nodeValue,
					{
						icon: MessageBox.Icon.ERROR,
						title: this._sErrorTitle,
						details: oParams.responseText,
						styleClass: oComponent.getContentDensityClass(),
						actions: [MessageBox.Action.CLOSE]
					}
				);
			} 
		},
		
		parseXML: function(sXMLString){
	        var xmlDoc=null;
	        //check browser type
	        //IE 
	        if(!window.DOMParser && window.ActiveXObject){
	            var xmlDomVersions = ['MSXML.2.DOMDocument.6.0','MSXML.2.DOMDocument.3.0','Microsoft.XMLDOM'];
	            for(var i=0;i<xmlDomVersions.length;i++){
	                try{
	                    xmlDoc = new window.ActiveXObject(xmlDomVersions[i]);
	                    xmlDoc.async = false;
	                    xmlDoc.loadXML(sXMLString);
	                    break;
	                }catch(e){
	                }
	            }
	        } else if(window.DOMParser && document.implementation && document.implementation.createDocument){
	        	//Mozilla
	            try{
	                var domParser = new DOMParser();
	                xmlDoc = domParser.parseFromString(sXMLString, 'text/xml');
	            }catch(e){
	            }
	        } else{
	            return null;
	        }
	        return xmlDoc;
		}
	};
});