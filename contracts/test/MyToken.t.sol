// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MyToken} from "../src/MyToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyTokenTest is Test {
    MyToken internal token;
    address internal owner = makeAddr("owner");
    address internal user = makeAddr("user");

    function setUp() public {
        vm.prank(owner);
        token = new MyToken();
    }

    function test_Metadata() public view {
        assertEq(token.name(), "MyToken");
        assertEq(token.symbol(), "MT");
        assertEq(token.decimals(), 18);
        assertEq(token.owner(), owner);
    }

    function test_MintByOwner() public {
        vm.prank(owner);
        token.mint(user, 1_000 ether);

        assertEq(token.balanceOf(user), 1_000 ether);
        assertEq(token.totalSupply(), 1_000 ether);
    }

    function test_RevertWhen_NonOwnerMints() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, user));
        token.mint(user, 1 ether);
    }

    function test_Transfer() public {
        vm.prank(owner);
        token.mint(user, 500 ether);

        vm.prank(user);
        token.transfer(makeAddr("recipient"), 200 ether);

        assertEq(token.balanceOf(user), 300 ether);
        assertEq(token.balanceOf(makeAddr("recipient")), 200 ether);
    }
}
