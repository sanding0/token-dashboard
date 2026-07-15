// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {MyToken} from "../src/MyToken.sol";

contract DeployMyToken is Script {
    function run() external returns (MyToken) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        MyToken token = new MyToken();

        vm.stopBroadcast();

        console2.log("MyToken deployed at:", address(token));
        console2.log("Owner:", token.owner());
        console2.log("Chain ID:", block.chainid);

        return token;
    }
}
