import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SUPER_ADMIN_ADDRESS="0x71d9edF4D3E671274852a992ab331A8f4775b3F9";
export default buildModule("PicknGetModule", (m) => {

  const superAdmin = m.getParameter("SUPER_ADMIN", SUPER_ADMIN_ADDRESS)
  const picknget = m.contract("PicknGet", [superAdmin]);

  return { picknget };
});
