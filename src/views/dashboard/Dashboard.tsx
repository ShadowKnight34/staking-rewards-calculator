import React, { useEffect, useState } from "react";
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
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAllBlogs } from "../../store/blogs";
import { selectBlogSearch } from "../../store/blogs/selectors";
import Text2 from "../../components/text/Text2";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import CalculateIcon from "@mui/icons-material/Calculate";
import TableChartIcon from "@mui/icons-material/TableChart";
import { useNavigate } from "react-router-dom";
import StakingCalculator from "./StakingCalculator/StakingCalculator";

const Dashboard = () => {
  const [isPublished, setIsPublished] = useState(false);
  const [activeTab, setActiveTab] = useState<'calculator' | 'offers'>('calculator');

  const dispatch = useAppDispatch();
  const searchText = useAppSelector(selectBlogSearch);
  const navigate = useNavigate();

  const theme = useTheme();

  const [search, setSearch] = useState(searchText);

  const handleSearchChange = (str: string) => {
    setSearch(str);
  };

  const handleSearchSubmit = (evt: any) => {
    if (evt.key === "Enter") dispatch(getAllBlogs({ search: search, page: 1 }));
  };

  const handleDetail = () => {
    navigate("/sell");
  };

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
              <TableRow
                hover
                sx={{
                  cursor: "pointer",
                  "& td": {
                    padding: "0px 5px",
                    borderRight: "2px solid #00dbe3",
                  },
                  "& td:last-child": { borderRight: "0px" },
                }}
              >
                <TableCell align="center">
                  <Text2>371</Text2>
                </TableCell>
                <TableCell>
                  <Text2>Token 1</Text2>
                </TableCell>
                <TableCell>
                  <Text2>USDC</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>10%</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>12%</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>20%</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>$51.35</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>$60.00</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>$16.85%</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>12.28838</Text2>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    aria-label="delete"
                    onClick={(event: any) => {
                      event.stopPropagation();
                    }}
                  >
                    <ShoppingCartOutlinedIcon
                      sx={{ fontSize: "24px", color: "#00dbe3" }}
                    />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    aria-label="delete"
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
              <TableRow
                hover
                sx={{
                  cursor: "pointer",
                  "& td": {
                    padding: "0px 5px",
                    borderRight: "2px solid #00dbe3",
                  },
                  "& td:last-child": { borderRight: "0px" },
                }}
              >
                <TableCell align="center">
                  <Text2>371</Text2>
                </TableCell>
                <TableCell>
                  <Text2>Token 1</Text2>
                </TableCell>
                <TableCell>
                  <Text2>USDC</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>10%</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>12%</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>20%</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>$51.35</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>$60.00</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>$16.85%</Text2>
                </TableCell>
                <TableCell align="center">
                  <Text2>12.28838</Text2>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    aria-label="delete"
                    onClick={(event: any) => {
                      event.stopPropagation();
                    }}
                  >
                    <ShoppingCartOutlinedIcon
                      sx={{ fontSize: "24px", color: "#00dbe3" }}
                    />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    aria-label="delete"
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
            </TableBody>
          </Table>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
