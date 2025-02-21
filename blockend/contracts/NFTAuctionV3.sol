// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ERC721A.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract NFTAuctionV3 is ERC721A, Ownable, ReentrancyGuard, IERC721Receiver {
    using Strings for uint256; // Use the Strings library for uint256
    uint256 public nextTokenId = 1;

    string public baseURI;
    string public baseExtension = ".json";
    uint256 public constant MAX_SUPPLY = 10000;
    mapping(uint256 => string) public tokenURIs;
    bool public readyToMint = true;
    address public dumpWallet;

    struct Auction {
        uint256 tokenId;
        uint256 startTime;
        uint256 duration;
        uint256 basePrice;
        uint256 highestBid;
        address highestBidder;
        address previousBidder;
        address[] bidders;
        uint256 minimumBidIncrement;
        status status;
    }
    struct Bid {
        address bidder;
        uint256 amount;
    }
    struct AuctionPayload {
        uint256 tokenId;
        uint256 startTime;
        uint256 duration;
        uint256 basePrice;
        uint256 highestBid;
        address highestBidder;
        address previousBidder;
        string tokenURI;
        uint256 minimumBidIncrement;
        status status;
        Bid[] bids;
    }
    struct UpcomingAuctionPayload {
        uint256 tokenId;
        string tokenURI;
    }

    enum status {
        idle,
        live,
        Ended,
        completed,
        cancelled
    }

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256[])) public bids;
    mapping(uint256 => Auction) public currentAuctions;

    event AuctionCreated(uint256 tokenId, uint256 duration, uint256 basePrice);
    event ERC721Received(address operator, address from, uint256 tokenId);
    event BidPlaced(uint256 tokenId, address bidder, uint256 amount);
    event AuctionEnded(uint256 tokenId);
    event AuctionCancelled(uint256 tokenId);

    constructor(
        string memory _initBaseURI,
        string memory tokenName,
        string memory tokenSymbol,
        address _dumpWallet
    ) ERC721A(tokenName, tokenSymbol) Ownable(msg.sender) ReentrancyGuard() {
        baseURI = _initBaseURI;
        dumpWallet = _dumpWallet;
    }

    function createAuction(
        uint256 tokenId,
        uint256 duration,
        uint256 basePrice,
        uint256 _minimumBidIncrement
    ) public onlyOwner {
        require(tokenId <= nextTokenId, "nft does not exist");
        require(duration > 0, "Duration must be greater than 0");
        require(
            tokenId <= nextTokenId,
            "Token ID must be less than or equal to the next token ID"
        );
        require(basePrice > 0, "Base price must be greater than 0");

        Auction memory newAuction = Auction({
            tokenId: tokenId,
            startTime: 0,
            duration: duration,
            basePrice: basePrice,
            highestBid: 0,
            highestBidder: address(0),
            previousBidder: address(0),
            bidders: new address[](0),
            minimumBidIncrement: _minimumBidIncrement,
            status: status.idle
        });

        auctions[tokenId] = newAuction;
        emit AuctionCreated(tokenId, duration, basePrice);
    }

    function bid(uint256 tokenId) public payable nonReentrant {
        require(tokenId <= nextTokenId, "nft does not exist");
        require(auctions[tokenId].tokenId == tokenId, "auction not listed yet");
        if (auctions[tokenId].status == status.live) {
            require(
                auctions[tokenId].startTime + auctions[tokenId].duration >
                    block.timestamp,
                "Auction has ended"
            );
        }
        if (auctions[tokenId].status == status.idle) {
            require(
                msg.value >= auctions[tokenId].basePrice,
                "invalid ether sent"
            );
            auctions[tokenId].startTime = block.timestamp;
            auctions[tokenId].status = status.live;
        } else {
            require(
                msg.value >=
                    auctions[tokenId].highestBid +
                        auctions[tokenId].minimumBidIncrement,
                "invalid ether sent"
            );
            payable(auctions[tokenId].previousBidder).transfer(
                auctions[tokenId].highestBid
            );
            uint256 timeLeft = (auctions[tokenId].startTime +
                auctions[tokenId].duration) - block.timestamp;
            if (timeLeft <= 5 minutes) {
                auctions[tokenId].duration += 5 minutes - timeLeft;
            }
        }
        // Transfer previous bidder

        bids[tokenId][msg.sender].push(msg.value);
        auctions[tokenId].highestBid = msg.value;
        auctions[tokenId].highestBidder = msg.sender;
        auctions[tokenId].previousBidder = msg.sender;

        // Add bidder to the list if not already present
        if (bids[tokenId][msg.sender].length == 1) {
            auctions[tokenId].bidders.push(msg.sender);
        }

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function endAuction(uint256 tokenId) public onlyOwner {
        require(tokenId <= nextTokenId, "nft does not exist");
        require(auctions[tokenId].tokenId == tokenId, "auction not listed yet");

        require(
            auctions[tokenId].status == status.live ||
                auctions[tokenId].status == status.idle,
            "Auction is not live"
        );

        auctions[tokenId].status = status.Ended;

        //check if all auctions are ended
        if (checkIfAllAuctionsAreEnded()) {
            //transfer NFTs

            require(transferNFTs(), "Failed to transfer NFTs");
        }

        emit AuctionEnded(tokenId);
    }

    function cancelAuction(uint256 tokenId) public onlyOwner {
        require(tokenId <= nextTokenId, "nft does not exist");
        require(auctions[tokenId].tokenId == tokenId, "auction not listed yet");
        require(
            auctions[tokenId].status == status.live ||
                auctions[tokenId].status == status.idle,
            "Auction is not live or already ended"
        );
        if (auctions[tokenId].status == status.live) {
            payable(auctions[tokenId].highestBidder).transfer(
                auctions[tokenId].highestBid
            );
        }
        auctions[tokenId].highestBidder = dumpWallet;
        auctions[tokenId].highestBid = 0;
        auctions[tokenId].status = status.cancelled;
        emit AuctionCancelled(tokenId);
    }

    function transferNFTs() internal onlyOwner returns (bool) {
        if (nextTokenId > 10) {
            for (uint256 i = nextTokenId - 11; i < nextTokenId - 1; i++) {
                safeTransferFrom(address(this), auctions[i].highestBidder, i);
                auctions[i].status = (auctions[i].highestBidder == dumpWallet)
                    ? status.cancelled
                    : status.completed;
            }
            return true;
        } else {
            for (uint256 i = 1; i < 11; i++) {
                safeTransferFrom(address(this), auctions[i].highestBidder, i);
                auctions[i].status = (auctions[i].highestBidder == dumpWallet)
                    ? status.cancelled
                    : status.completed;
            }
            return true;
        }
    }

    function checkIfAllAuctionsAreEnded() internal view returns (bool) {
        if (nextTokenId > 10) {
            for (uint256 i = nextTokenId - 11; i < nextTokenId - 1; i++) {
                if (
                    auctions[i].status != status.Ended ||
                    auctions[i].status != status.cancelled
                ) {
                    return false;
                }
            }
        } else {
            for (uint256 i = 1; i < 11; i++) {
                if (
                    auctions[i].status != status.Ended ||
                    auctions[i].status != status.cancelled
                ) {
                    return false;
                }
            }
        }
        return true;
    }

    function _setTokenURI(string[] memory _tokenURI) internal virtual {
        for (uint256 i = 0; i < _tokenURI.length; ) {
            tokenURIs[nextTokenId] = _tokenURI[i];
            nextTokenId++;
            unchecked {
                i++;
            }
        }
    }

    function ownerMint(string[] memory uri) public onlyOwner {
        require(readyToMint, "Not ready to mint,auctions in progress");
        _safeMint(address(this), 10);
        _setTokenURI(uri);
        readyToMint = false;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function tokenURI(
        uint256[] memory tokenIds
    ) public view returns (string[] memory) {
        string[] memory uris = new string[](tokenIds.length);
        for (uint i = 0; i < tokenIds.length; i++) {
            require(
                _exists(tokenIds[i]),
                "ERC721Metadata: URI query for nonexistent token"
            );

            string memory currentBaseURI = _baseURI();
            uris[i] = bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenURIs[tokenIds[i]],
                        baseExtension
                    )
                )
                : "";
        }
        return uris;
    }

    function withdraw() external onlyOwner nonReentrant {
        require(readyToMint, "satisfy all auctions before withdrawing");
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Transfer failed");
    }

    function getUpcomingAuctions()
        public
        view
        returns (UpcomingAuctionPayload[] memory)
    {
        uint256 count = 0;
        for (uint256 i = 1; i < nextTokenId; i++) {
            if (auctions[i].tokenId != i) {
                count++;
            }
        }
        UpcomingAuctionPayload[]
            memory upcomingAuctions = new UpcomingAuctionPayload[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < nextTokenId; i++) {
            if (auctions[i].tokenId != i) {
                upcomingAuctions[index] = UpcomingAuctionPayload({
                    tokenId: i,
                    tokenURI: tokenURIs[i]
                });
                index++;
            }
        }
        return upcomingAuctions;
    }

    function getLiveAuctions() public view returns (AuctionPayload[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= nextTokenId; i++) {
            if (
                auctions[i].status == status.live ||
                auctions[i].status == status.idle
            ) {
                count++;
            }
        }

        AuctionPayload[] memory liveAuctions = new AuctionPayload[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= nextTokenId; i++) {
            if (
                auctions[i].status == status.live ||
                auctions[i].status == status.idle
            ) {
                liveAuctions[index] = AuctionPayload({
                    tokenId: auctions[i].tokenId,
                    startTime: auctions[i].startTime,
                    duration: auctions[i].duration,
                    basePrice: auctions[i].basePrice,
                    highestBid: auctions[i].highestBid,
                    highestBidder: auctions[i].highestBidder,
                    previousBidder: auctions[i].previousBidder,
                    status: auctions[i].status,
                    tokenURI: tokenURIs[auctions[i].tokenId],
                    minimumBidIncrement: auctions[i].minimumBidIncrement,
                    bids: getBids(auctions[i].tokenId)
                });
                index++;
            }
        }

        return liveAuctions;
    }

    function getBids(uint256 tokenId) public view returns (Bid[] memory) {
        require(tokenId <= nextTokenId, "Token ID does not exist");

        // Get auction details
        Auction storage auction = auctions[tokenId];
        address[] memory bidders = auction.bidders;

        // Calculate total number of bids
        uint256 totalBids = 0;
        for (uint256 i = 0; i < bidders.length; i++) {
            totalBids += bids[tokenId][bidders[i]].length;
        }

        // Create array of all bids
        Bid[] memory allBids = new Bid[](totalBids);
        uint256 currentIndex = 0;

        // Populate all bids
        for (uint256 i = 0; i < bidders.length; i++) {
            uint256[] memory bidderBids = bids[tokenId][bidders[i]];
            for (uint256 j = 0; j < bidderBids.length; j++) {
                allBids[currentIndex] = Bid({
                    bidder: bidders[i],
                    amount: bidderBids[j]
                });
                currentIndex++;
            }
        }

        return allBids;
    }

    function getEndedAuctions() public view returns (AuctionPayload[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= nextTokenId; i++) {
            if (
                auctions[i].status == status.Ended ||
                auctions[i].status == status.completed ||
                auctions[i].status == status.cancelled
            ) {
                count++;
            }
        }

        AuctionPayload[] memory endedAuctions = new AuctionPayload[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= nextTokenId; i++) {
            if (
                auctions[i].status == status.Ended ||
                auctions[i].status == status.completed ||
                auctions[i].status == status.cancelled
            ) {
                endedAuctions[index] = AuctionPayload({
                    tokenId: auctions[i].tokenId,
                    startTime: auctions[i].startTime,
                    duration: auctions[i].duration,
                    basePrice: auctions[i].basePrice,
                    highestBid: auctions[i].highestBid,
                    highestBidder: auctions[i].highestBidder,
                    previousBidder: auctions[i].previousBidder,
                    status: auctions[i].status,
                    tokenURI: tokenURIs[auctions[i].tokenId],
                    minimumBidIncrement: auctions[i].minimumBidIncrement,
                    bids: getBids(auctions[i].tokenId)
                });
                index++;
            }
        }

        return endedAuctions;
    }

    function getAuctionForTokenId(
        uint256 tokenId
    ) public view returns (AuctionPayload memory) {
        require(tokenId <= nextTokenId, "Token ID does not exist");
        require(auctions[tokenId].tokenId == tokenId, "auction not listed yet");
        AuctionPayload memory auction = AuctionPayload({
            tokenId: auctions[tokenId].tokenId,
            startTime: auctions[tokenId].startTime,
            duration: auctions[tokenId].duration,
            basePrice: auctions[tokenId].basePrice,
            highestBid: auctions[tokenId].highestBid,
            highestBidder: auctions[tokenId].highestBidder,
            previousBidder: auctions[tokenId].previousBidder,
            status: auctions[tokenId].status,
            tokenURI: tokenURIs[auctions[tokenId].tokenId],
            minimumBidIncrement: auctions[tokenId].minimumBidIncrement,
            bids: getBids(auctions[tokenId].tokenId)
        });
        return auction;
    }

    function setMinimumBidIncrement(
        uint256 _minimumBidIncrement,
        uint256 tokenId
    ) public onlyOwner {
        require(tokenId <= nextTokenId, "Token ID does not exist");
        require(auctions[tokenId].status == status.live, "Auction is not live");

        auctions[tokenId].minimumBidIncrement = _minimumBidIncrement;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        emit ERC721Received(operator, from, tokenId);
        return this.onERC721Received.selector;
    }
}
