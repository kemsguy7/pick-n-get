// // ensure walletconnect is initialized only once
// let walletConnectInitPromise: Promise<void> | undefined = undefined;
// const initializeWalletConnect = async () => {
//   if (walletConnectInitPromise === undefined) {
//     walletConnectInitPromise = dappConnector.init();
//   }
//   await walletConnectInitPromise;
// };



// export const openWalletConnectModal = async () => {
//   await initializeWalletConnect();
//   await dappConnector.openModal().then((x) => {
//     refreshEvent.emit("sync");
//   });
// };