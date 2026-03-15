sap.ui.define([], function () {
    "use strict";

    return {
        movementState: function (sMovementType) {
            if (!sMovementType) return "None";
            // Receipt types: 101, 501
            if (sMovementType === "101" || sMovementType === "501") {
                return "Success";
            }
            // Issue/Cancellation types: 102, 201, 261, 502
            if (sMovementType === "102" || sMovementType === "201" || sMovementType === "261" || sMovementType === "502") {
                return "Error";
            }
            return "Warning";
        },

        quantityText: function (sQuantity, sMovementType) {
            if (!sQuantity) return "0";
            var fQuantity = parseFloat(sQuantity);
            
            if (sMovementType === "101" || sMovementType === "501") {
                return "+" + fQuantity;
            }
            if (sMovementType === "102" || sMovementType === "201" || sMovementType === "261" || sMovementType === "502") {
                return "-" + fQuantity;
            }
            return fQuantity.toString();
        }
    };
});
