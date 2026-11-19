import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SearchBar from "../../components/text/SearchText";
import Text2 from "../../components/text/Text2";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import CalculateIcon from "@mui/icons-material/Calculate";
import TableChartIcon from "@mui/icons-material/TableChart";
import { useNavigate } from "react-router-dom";
import StakingCalculator from "./StakingCalculator/StakingCalculator";
import { useAppDispatch } from "../../store/hooks";
import { showAlert } from "../../store/alert";

interface MarketplaceOffer {
  id: string;
  offerToken: string;
  buyerToken: string;
  rateOfReturn: string;
  offerYield: string;
  yieldDiff: string;
  officialPrice: string;
  askedPrice: string;
  priceDiff: string;
  stock: string;
  whitelisted: boolean;
}

const INITIAL_OFFERS: MarketplaceOffer[] = [
  {
    id: "371",
    offerToken: "Token 1",
    buyerToken: "USDC",
    rateOfReturn: "10%",
    offerYield: "12%",
    yieldDiff: "20%",
    officialPrice: "$51.35",
    askedPrice: "$60.00",
    priceDiff: "+16.85%",
    stock: "12.28838",
    whitelisted: true,
  },
  {
    id: "372",
    offerToken: "Token 2",
    buyerToken: "USDT",
    rateOfReturn: "8.5%",
    offerYield: "9.2%",
    yieldDiff: "8.2%",
    officialPrice: "$100.00",
    askedPrice: "$98.50",
    priceDiff: "-1.50%",
    stock: "45.00000",
    whitelisted: false,
  },
  {
    id: "373",
    offerToken: "Token 3",
    buyerToken: "USDC",
    rateOfReturn: "14%",
    offerYield: "15.5%",
    yieldDiff: "10.7%",
    officialPrice: "$25.00",
    askedPrice: "$24.20",
    priceDiff: "-3.20%",
    stock: "230.1500",
    whitelisted: true,
  },
  {
    id: "374",
    offerToken: "Token 1",
    buyerToken: "DAI",
    rateOfReturn: "11%",
    offerYield: "12.8%",
    yieldDiff: "16.4%",
    officialPrice: "$51.35",
    askedPrice: "$52.00",
    priceDiff: "+1.27%",
    stock: "8.50000",
    whitelisted: true,
  },
];

const Dashboard = () => {
  const [isPublished, setIsPublished] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'offers'>('calculator');
  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSearchChange = (str: string) => {
    setSearch(str);
  };

  const handleSearchSubmit = (evt: any) => {
    if (evt.key === "Enter") {
      setActiveTab('offers');
    }
  };

  const handleDetail = () => {
    navigate("/sell");
  };

  const handleToggleCart = (offerId: string) => {
    if (cartItems.includes(offerId)) {
      setCartItems(cartItems.filter(id => id !== offerId));
      dispatch(showAlert({ message: `Offer #${offerId} removed from cart.`, severity: "info" }));
    } else {
      setCartItems([...cartItems, offerId]);
      dispatch(showAlert({ message: `Offer #${offerId} added to cart!`, severity: "success" }));
    }
  };

  // Filter offers based on search and whitelisted filter
  const filteredOffers = INITIAL_OFFERS.filter((item) => {
    if (isPublished && !item.whitelisted) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        item.id.toLowerCase().includes(q) ||
        item.offerToken.toLowerCase().includes(q) ||
        item.buyerToken.toLowerCase().includes(q) ||
        item.officialPrice.toLowerCase().includes(q) ||
        item.askedPrice.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  return (
    <Box>
      <Box sx={{ background: "linear-gradient(to bottom, #173039, #00b4c9)" }}>
        <Box
          sx={{
            padding: "50px 80px",
            [theme.breakpoints.up("sm")]: { maxWidth: "1400px" },
            width: "calc(100vw - 6px)",
            margin: "auto",
            textAlign: "left",
          }}
        >
          <Typography
            sx={{
              fontSize: "45px",
              lineHeight: "60px",
              color: "#fff",
              fontWeight: 700,
              marginBottom: "20px",
            }}
          >
            Filters
          </Typography>
          <SearchBar
            search={search}
            handleSearch={handleSearchChange}
            handleKeyDown={handleSearchSubmit}
          />
          <Box
            sx={{ display: "flex", alignItems: "center", paddingLeft: "20px" }}
          >
            <Checkbox
              {...label}
              checked={isPublished}
              sx={{ "& .MuiSvgIcon-root": { fill: "#ffffff" } }}
              onClick={(e: any) => setIsPublished(!isPublished)}
            />
            <Typography
              sx={{
                fontSize: "18px",
                lineHeight: "60px",
                color: "#fff",
                fontWeight: 400,
              }}
            >
              Show only whitelisted properties's offers
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          minHeight: "calc(100vh - 450px)",
          backgroundColor: "#fff",
          padding: { xs: "30px 16px", md: "50px 24px" },
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: "24px",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: { md: "280px" } }}>
          <Button
            variant="contained"
            onClick={() => setActiveTab('calculator')}
            startIcon={<CalculateIcon sx={{ fontSize: '28px !important' }} />}
            sx={{
              backgroundColor: activeTab === 'calculator' ? "#00dbe3" : "#173039",
              borderRadius: "6px",
              width: { xs: "100%", md: "280px" },
              height: "64px",
              fontSize: "18px",
              textTransform: "uppercase",
              color: "#ffffff",
              fontWeight: 700,
              boxShadow: activeTab === 'calculator' ? "0 4px 14px rgba(0, 219, 227, 0.4)" : "none",
              '&:hover': {
                backgroundColor: activeTab === 'calculator' ? "#00b4c9" : "#23a2bb",
              },
            }}
          >
            Staking Calculator
          </Button>
          <Button
            variant="contained"
            onClick={() => setActiveTab('offers')}
            sx={{
              backgroundColor: activeTab === 'offers' ? "#00dbe3" : "#23a2bb",
              borderRadius: "6px",
              width: { xs: "100%", md: "280px" },
              height: "64px",
              fontSize: "20px",
              textTransform: "uppercase",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            Sell
          </Button>
          <Button
            variant="contained"
            onClick={() => setActiveTab('offers')}
            sx={{
              backgroundColor: "#23a2bb",
              borderRadius: "6px",
              width: { xs: "100%", md: "280px" },
              height: "64px",
              fontSize: "20px",
              textTransform: "uppercase",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            Buy
          </Button>
          <Button
            variant="contained"
            onClick={() => setActiveTab('offers')}
            sx={{
              backgroundColor: "#173039",
              borderRadius: "6px",
              width: { xs: "100%", md: "280px" },
              height: "64px",
              fontSize: "20px",
              textTransform: "uppercase",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            Exchange
          </Button>
        </Box>

        <Box sx={{ overflow: "auto", flexGrow: 1, width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              textColor="primary"
              indicatorColor="primary"
              sx={{
                "& .MuiTab-root": {
                  fontSize: "16px",
                  fontWeight: 700,
                  textTransform: "none",
                  minHeight: "48px",
                },
              }}
            >
              <Tab
                icon={<CalculateIcon />}
                iconPosition="start"
                label="DeFi Staking Rewards Calculator"
                value="calculator"
              />
              <Tab
                icon={<TableChartIcon />}
                iconPosition="start"
                label="Marketplace Offers"
                value="offers"
              />
            </Tabs>
          </Box>

          {activeTab === 'calculator' ? (
            <StakingCalculator />
          ) : (
          <Table
            aria-label="simple table"
            sx={{
              borderCollapse: "unset",
              whiteSpace: "nowrap",
              borderRadius: "8px",
              border: "2px solid #00dbe3",
            }}
          >
            <TableHead sx={{ background: "#f3f3f3" }}>
              <TableRow
                sx={{
                  "& th": {
                    padding: "0px 5px",
                    borderRight: "2px solid #00dbe3",
                  },
                  "& th:first-child": {
                    borderTopLeftRadius: "8px",
                  },
                  "& th:last-child": {
                    borderRight: "0px",
                    borderTopRightRadius: "8px",
                  },
                }}
              >
                <TableCell align="center">
                  <Text2>Offer ID</Text2>
                </TableCell>
                <TableCell>
                  <Text2>Offer Token</Text2>
                </TableCell>
                <TableCell>
                  <Text2>Buyer token</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>Rate of Return</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>offer Yield</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>% Difference</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>Official price</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>Asked Price</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>% Difference</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>Stock</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>Cart</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>View</Text2>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOffers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                    <Typography sx={{ color: "#668087", fontSize: "16px" }}>
                      No marketplace offers match your filter criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOffers.map((item) => {
                  const isInCart = cartItems.includes(item.id);
                  return (
                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        cursor: "pointer",
                        "& td": {
                          padding: "8px 5px",
                          borderRight: "2px solid #00dbe3",
                        },
                        "& td:last-child": { borderRight: "0px" },
                      }}
                    >
                      <TableCell align="center">
                        <Text2>{item.id}</Text2>
                      </TableCell>
                      <TableCell>
                        <Text2>{item.offerToken}</Text2>
                      </TableCell>
                      <TableCell>
                        <Text2>{item.buyerToken}</Text2>
                      </TableCell>
                      <TableCell align="center">
                        <Text2>{item.rateOfReturn}</Text2>
                      </TableCell>
                      <TableCell align="center">
                        <Text2>{item.offerYield}</Text2>
                      </TableCell>
                      <TableCell align="center">
                        <Text2>{item.yieldDiff}</Text2>
                      </TableCell>
                      <TableCell align="center">
                        <Text2>{item.officialPrice}</Text2>
                      </TableCell>
                      <TableCell align="center">
                        <Text2>{item.askedPrice}</Text2>
                      </TableCell>
                      <TableCell align="center">
                        <Text2>{item.priceDiff}</Text2>
                      </TableCell>
                      <TableCell align="center">
                        <Text2>{item.stock}</Text2>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          aria-label="cart"
                          onClick={(event: any) => {
                            event.stopPropagation();
                            handleToggleCart(item.id);
                          }}
                        >
                          <ShoppingCartOutlinedIcon
                            sx={{ fontSize: "24px", color: isInCart ? "#173039" : "#00dbe3" }}
                          />
                        </IconButton>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          aria-label="view detail"
                          onClick={(event: any) => {
                            event.stopPropagation();
                            handleDetail();
                          }}
                        >
                          <RemoveRedEyeOutlinedIcon
                            sx={{ fontSize: "24px", color: "#00dbe3" }}
                          />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
