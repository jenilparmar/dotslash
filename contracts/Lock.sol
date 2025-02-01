// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "hardhat/console.sol";

contract Lock {
    struct content {
        string userStatement;
        string queryPoint;
        string intent;
        string transactionId;
        uint time;
    }

    struct addressUser {
        address add;
        string name;
    }

    mapping(address => content[]) contentList;
    mapping(address => string) private connectionString;
    mapping(address => mapping(address => bool)) ownership;
    mapping(address => addressUser[]) access;
    mapping(address => mapping(address => bool)) prevownership;

    function upload(
        address _user,
        string memory _userStatement,
        string memory _queryPoint,
        string memory _transactionId,
        string memory _intent
    ) public {
        require(
            ownership[_user][msg.sender],
            "You dont have access to upload to his database"
        );
        console.log("userStatement: %s", _intent);
        contentList[_user].push(
            content(
                _userStatement,
                _queryPoint,
                _transactionId,
                _intent,
                block.timestamp
            )
        );
    }
    function uploadByOur(
        string memory _userStatement,
        string memory _queryPoint,
        string memory _transactionId,
        string memory _intent
    ) public {
        contentList[msg.sender].push(
            content(
                _userStatement,
                _queryPoint,
                _transactionId,
                _intent,
                block.timestamp
            )
        );
    }

    function addPermission(address _add, string memory name) public {
        if (msg.sender == _add) {
            revert("you are only owner");
        } else if (prevownership[msg.sender][_add]) {
            ownership[msg.sender][_add] = true;
        } else {
            ownership[msg.sender][_add] = true;
            access[msg.sender].push(addressUser(_add, name));
            prevownership[msg.sender][_add] = true;
        }
    }
    function addConnectionString(string memory _url) public {
        connectionString[msg.sender] = _url;
    }

    function viewConnectionString(
        address user
    ) public view returns (string memory) {
        if (ownership[user][msg.sender]) {
            return connectionString[user];
        } else {
            revert("you are not allowed to view ");
        }
    }
    function viewAll(address _add) public view returns (content[] memory) {
        require(
            ownership[_add][msg.sender],
            "You do not have permission to view this data"
        );
        require(
            contentList[_add].length > 0,
            "No content available for this user"
        );

        return contentList[_add];
    }
    function viewUserItsellf() public view returns (content[] memory) {
        return contentList[msg.sender];
    }
    function sharedAccessWith() public view returns (string[] memory) {
        uint256 userLength = access[msg.sender].length;
        uint256 validCount = 0;

        for (uint256 i = 0; i < userLength; i++) {
            if (ownership[msg.sender][access[msg.sender][i].add]) {
                validCount++;
            }
        }

        string[] memory user = new string[](validCount * 2);
        uint256 index = 0;

        for (uint256 i = 0; i < userLength; i++) {
            if (ownership[msg.sender][access[msg.sender][i].add]) {
                user[index] = addressToString(access[msg.sender][i].add);
                user[index + 1] = access[msg.sender][i].name;
                index += 2;
            }
        }

        return user;
    }

    function addressToString(
        address _addr
    ) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        console.log(string(str));
        return string(str);
    }

    function removeAccess(address add) public {
        require(
            ownership[msg.sender][add],
            "you already didnt give access to this account "
        );
        ownership[msg.sender][add] = false;
    }
}
