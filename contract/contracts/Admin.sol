// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;
import "./library/ItemLib.sol";


contract Admin { 
    using ItemLib for string;

    address[] admins;
    uint256 count;
    address public SUPER_ADMIN;

    error NotAuthorised();
    error InValid();

    mapping(address => uint256) public adminId;
    mapping(address => bool ) public isAdminRegistered;
    mapping(uint256 => address) public idToAdmin;
    mapping(ItemLib.ItemType => uint256) public rates;

    event RateUpdated(ItemLib.ItemType indexed itemType, uint256 newRate);

    function _onlyAdmin() private view {
      if(!isAdminRegistered[msg.sender]){
            revert NotAuthorised();
        }
    }

    function _registerAdmin(address _admin) internal {
        // require(msg.sender == SUPER_ADMIN, "Only Super Admin can add Admin");
        if(_admin == address(0)){
            revert InValid();
        }
        require(!isAdminRegistered[_admin], "Already Registered");
        admins.push(_admin);
        count++;
        isAdminRegistered[_admin] = true;
        idToAdmin[count] = _admin;
        adminId[_admin] = count;
    }

    function _deleteAdmin(address _admin) internal {
        require(msg.sender == SUPER_ADMIN, "Only Super Admin can add Admin");
        require(isAdminRegistered[_admin], "Not Registered");
        for(uint256 i = 0; i < admins.length; i++){
            if(admins[i] == _admin){
                admins[i] = admins[admins.length - 1];
                admins.pop();

                uint256 _id = adminId[_admin];
                delete adminId[_admin];
                delete idToAdmin[_id];
                isAdminRegistered[_admin] = false;
                break;
            }
        }

    }

    function _deleteAdminById(uint256 id) internal {
        require(msg.sender == SUPER_ADMIN, "Only Super Admin can add Admin");

        address _admin = idToAdmin[id]; 
        require(_admin != address(0), "Invalid ID");

        for(uint256 i = 0; i < admins.length; i++){
            if(admins[i] == _admin){
                admins[i] = admins[admins.length - 1];
                admins.pop();

                delete adminId[_admin];
                delete idToAdmin[id];   
                isAdminRegistered[_admin] = false;
                break;
            }
        }
    }


    function _setRate(ItemLib.ItemType _type, uint256 _rateTinybarsPerKg) internal{
        _onlyAdmin();
        rates[_type] = _rateTinybarsPerKg;
        emit RateUpdated(_type, _rateTinybarsPerKg);
    }

    function onlyAdmin() internal view {
        _onlyAdmin();
    }    

}