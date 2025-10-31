// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Product {
    uint8 constant DECIMALS = 8;
    uint256 public globalProductId;
    uint256 public registrationCount;
    address public pickngetContract;

    enum ProductStatus {Available, NotAvailable}

    constructor(address _pickngetContract) {
        require(_pickngetContract != address(0), "Invalid PicknGet address"); 
        pickngetContract = _pickngetContract;
    }

    struct Producer {
        string name;
        string country;
        uint256 phoneNumber;
        bool isRegistered;
    }

    struct ProductItem {
        uint256 productId;
        string name;
        uint256 quantity;
        address owner;
        string description;
        bytes data; 
        uint256 amount;
        ProductStatus productStatus;
    }

    mapping(address => Producer) public producers;           
    mapping(uint256 => ProductItem) public products;         
    mapping(address => uint256[]) public productsByOwner;    
    mapping(uint256 => mapping(address => bool)) public hasBuyerPaid; 

    event ProducerRegistered(address indexed producer, uint256 registrationId);
    event ProductAdded(uint256 indexed productId, address indexed owner);
    event ProductPurchased(uint256 indexed productId, address indexed buyer, uint256 amountPaid);


    error AlreadyRegistered();
    error InvalidAddress();
    error ProductSoldOut();
    error InsufficientStock();
    error NotAuthorized();

  
    function registerProducer(address _producer, string memory _name, string memory _country, uint256 _phoneNumber) external {
        if(_producer == address(0)) revert InvalidAddress();
        if(producers[_producer].isRegistered) revert AlreadyRegistered();

        registrationCount++;
        producers[_producer] = Producer({
            name: _name,
            country: _country,
            phoneNumber: _phoneNumber,
            isRegistered: true
        });

        emit ProducerRegistered(_producer, registrationCount);
    }

    function addProduct(string memory _name, uint256 _quantity, string memory _description, bytes memory _data, uint256 _amount) external {
        Producer memory producer = producers[msg.sender];
        if(!producer.isRegistered) revert NotAuthorized();

        globalProductId++;
        uint256 productId = globalProductId;

        products[productId] = ProductItem({
            productId: productId,
            name: _name,
            quantity: _quantity,
            owner: msg.sender,
            description: _description,
            data: _data,
            amount: _amount * (10**DECIMALS),
            productStatus: ProductStatus.Available
        });

        productsByOwner[msg.sender].push(productId);

        emit ProductAdded(productId, msg.sender);
    }

    function shopProduct(uint256 _productId, uint256 _quantity) external payable {
        ProductItem storage product = products[_productId];
        if(product.productStatus == ProductStatus.NotAvailable) revert ProductSoldOut();
        if(product.quantity < _quantity) revert InsufficientStock();

        uint256 totalCost = _quantity * product.amount;
        require(msg.value == totalCost, "Incorrect payment");

        product.quantity -= _quantity;
        if(product.quantity == 0) product.productStatus = ProductStatus.NotAvailable;

       
        uint256 fee = msg.value / 10;
        uint256 payout = msg.value - fee;

        (bool sentFee, ) = payable(pickngetContract).call{value: fee}("");
        require(sentFee, "Fee transfer failed");
        (bool sentPayout, ) = payable(product.owner).call{value: payout}("");
        require(sentPayout, "Payout failed");

        hasBuyerPaid[_productId][msg.sender] = true;

        emit ProductPurchased(_productId, msg.sender, msg.value);
    }


    function getProductsByOwner(address _owner) external view returns(uint256[] memory) {
        return productsByOwner[_owner];
    }

    function getProductOwner(uint256 _productId) external view returns(address) {
        return products[_productId].owner;
    }

    receive() external payable {
        (bool sent, ) = payable(pickngetContract).call{value: msg.value}("");
        require(sent, "Forward failed");
    }

    fallback() external payable {
        (bool sent, ) = payable(pickngetContract).call{value: msg.value}("");
        require(sent, "Forward failed");
    }
}
