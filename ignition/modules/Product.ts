import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const pickngetContract = "0x2Caa291ceDF1c2b8AAA9053B1d3C496E3A5CF83A";
export default buildModule("ProductModule", (m) => {

  const picknget = m.getParameter("pickngetContract", pickngetContract)
  const product = m.contract("Product", [picknget]);

  return { product };
});
