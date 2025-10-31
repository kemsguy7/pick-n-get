import { expect } from "chai";
import { network } from "hardhat";
const { networkHelpers } = await network.connect();
import PicknGet from "../ignition/modules/PicknGet.ts";

const { ethers } = await network.connect();

describe("PicknGet", function () {
    async function deployPicknGet() {
        const picknget = await ethers.getContractFactory("PicknGet");
        const PicknGet = await picknget.deploy();
        await PicknGet.waitForDeployment();

        const [owner, user1, user2, user3] = await ethers.getSigners();

        return {PicknGet, owner, user1, user2, user3};
    }
    
    describe("Deployment", function() {
        it("should deploy the contract", async function(){
            const {PicknGet} =  await networkHelpers.loadFixture(deployPicknGet);
            expect(await PicknGet.getAddress()).to.properAddress;
        })
    })

    describe("Register User", function() {
        it("should register user", async function(){
            const {PicknGet, user1} =  await networkHelpers.loadFixture(deployPicknGet);
            const address = "home address";
            const number = 123456789;
            await PicknGet.connect(user1).registerUser(address, number);
            const userId = await PicknGet.userId;
            expect(userId).to.not.equal(0);
        })
    })

    describe("Register Producer", function() {
        it("should register producer", async function(){
            const {PicknGet, user2} =  await networkHelpers.loadFixture(deployPicknGet);
            let name = "my name";
            let country = "my country";
            let number = 9023333;
            await PicknGet.connect(user2).registerProducer(name, country,number);

            const producerId = await PicknGet.registrationId(user2.address);
            const producer = await PicknGet.ownerDetails(producerId);
            expect(producer.name).to.equal(name);
            expect(producer.country).to.equal(country);
            expect(producer.phoneNumber).to.equal(number);
        })
    })

    describe("Add Product", function () {
        it("should allow a producer to add a product", async function () {
            const { PicknGet, user2 } = await networkHelpers.loadFixture(deployPicknGet);


            // Get producer id (assume your contract stores mapping of address -> producerId)
            const producerId = await PicknGet.registrationId(user2.address);

            // Add product
            const productId = 1;
            const productName = "Eco Soap";
            const productData = ethers.encodeBytes32String("organic ingredients"); // example encoding
            const productAmount = 100;
            const productQuantity = 50; 

            await PicknGet.connect(user2).addProduct(producerId, productName,productQuantity, productData, productAmount);

            // Verify from mapping
            const product = await PicknGet.allProductsByProducer(producerId, productId);
            expect(product.name).to.equal(productName);
            expect(product.amount).to.equal(productAmount*10**8);
        });
    });    

    describe("Shop Product", function () {
        it("should allow a user to shop a product", async function () {
            const { PicknGet, user1, user2 } = await networkHelpers.loadFixture(deployPicknGet);

            const producerId = await PicknGet.registrationId(user2.address);

            const productId = 2;
            const productName = "Eco Soap";
            const productData = ethers.encodeBytes32String("organic ingredients");
            const DECIMALS = 8n; // Tinybar decimals
            const productQuantity = 50; // Initial stock
            const productPrice = 5; // Price per unit in Tinybars

            await PicknGet.connect(user2).addProduct(
                producerId,
                productName,
                productQuantity,
                productData,
                productPrice
            );

            const shopQuantity = 5;
            const totalCost = (productPrice * 10**8 ) * shopQuantity;

            await PicknGet.connect(user1).shopProduct(productId, shopQuantity, { value: totalCost });

            const products = await PicknGet.allProductsByProducer(producerId, productId);

            expect(products.quantity).to.equal(productQuantity - Number(shopQuantity));

            expect(products.amount).to.equal(productPrice*(10**8));
        });
    });    

});