/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"com/kanban/dash/ZRPE_KB_DASH2/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});