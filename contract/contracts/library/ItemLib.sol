// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library ItemLib {
    enum ItemType { PAPER, PLASTIC, METALS, GLASS, ELECTRONICS, TEXTILES, OTHERS }

     function _toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        for (uint i = 0; i < bStr.length; i++) {
            if (bStr[i] >= 0x41 && bStr[i] <= 0x5A) {
                bStr[i] = bytes1(uint8(bStr[i]) + 32);
            }
        }
        return string(bStr);
    }

    function toItemType(string memory _type) internal pure returns (ItemType) {
        string memory lowerType = _toLower(_type);
        bytes32 t = keccak256(bytes(lowerType));

        if (t == keccak256(bytes("paper"))) {
            return ItemType.PAPER;
        } else if (t == keccak256(bytes("plastic"))) {
            return ItemType.PLASTIC;
        } else if (t == keccak256(bytes("metals"))) {
            return ItemType.METALS;
        } else if (t == keccak256(bytes("glass"))) {
            return ItemType.GLASS;
        } else if (t == keccak256(bytes("electronics"))) {
            return ItemType.ELECTRONICS;
        } else if (t == keccak256(bytes("textiles"))) {
            return ItemType.TEXTILES;
        } else {
            return ItemType.OTHERS;
        }
    }
}
