import React, { FC, useState } from "react";
import Box from "@mui/material/Box";
import { navigations } from "./navigation.data";
import { Link } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import BitcoinBuyModal from "../modal/BitcoinBuyModal";
import { data as bitcoinData } from "../bitcoin-carousel/bitcoin-slider.data";
import { useAppDispatch } from "../../store/hooks";
import { showAlert } from "../../store/alert";

type NavigationData = {
  path: string;
  label: string;
};

const Navigation: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentPath = location.pathname;

  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [openWalletModal, setOpenWalletModal] = useState(false);

  const handleConnectWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
      setWalletAddress("");
      dispatch(showAlert({ message: "Wallet disconnected.", severity: "info" }));
    } else {
      // Connect mock Web3 wallet
      const mockAddr = "0x71C...49A2";
      setWalletConnected(true);
      setWalletAddress(mockAddr);
      dispatch(
        showAlert({
          message: `Connected wallet ${mockAddr} (Ethereum Mainnet)`,
          severity: "success",
        })
      );
    }
  };

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (path === "/explore" || path === "/offers") {
      navigate("/dashboard");
    } else if (path === "/history") {
      setOpenWalletModal(true);
    } else if (path === "/language") {
      dispatch(showAlert({ message: "Language set to English (EN).", severity: "info" }));
    } else {
      navigate(path);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexFlow: "wrap",
        justifyContent: "end",
        alignItems: "center",
        flexDirection: { xs: "column", lg: "row" }
      }}
    >
      {navigations.map(({ path: destination, label }: NavigationData) =>
        <Box
          key={label}
          component={Link}
          onClick={(e: React.MouseEvent) => handleNavClick(e, destination)}
          sx={{
            display: "inline-flex",
            position: "relative",
            color: currentPath === destination ? "primary.main" : "white",
            lineHeight: "30px",
            letterSpacing: "3px",
            cursor: "pointer",
            textDecoration: "none",
            textTransform: "uppercase",
            fontWeight: 700,
            alignItems: "center",
            justifyContent: "center",
            px: { xs: 0, lg: 3 },
            mb: { xs: 3, lg: 0 },
            fontSize: "20px",
            ...destination === "/" && { color: "primary.main" },
            "& > div": { display: "none" },
            "&.current>div": { display: "block" },
            "&:hover": {
              color: "#00dbe3"
            }
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 12,
              transform: "rotate(3deg)",
              "& img": { width: 44, height: "auto" }
            }}
          >
            {/* eslint-disable-next-line */}
            <img src="/images/headline-curve.svg" alt="Headline curve" />
          </Box>
          {label}
        </Box>
      )}
      <Box
        onClick={handleConnectWallet}
        sx={{
          position: "relative",
          color: walletConnected ? "#173039" : "white",
          cursor: "pointer",
          textDecoration: "none",
          textTransform: "uppercase",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 0, lg: 3 },
          mb: { xs: 3, lg: 0 },
          fontSize: "20px",
          lineHeight: "6px",
          minWidth: "240px",
          height: "45px",
          borderRadius: "6px",
          backgroundColor: walletConnected ? "#9FF1D2" : "#00dbe3",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: walletConnected ? "#80e5be" : "#00b4c9",
            transform: "translateY(-1px)",
          }
        }}
      >
        {walletConnected ? `Connected: ${walletAddress}` : "Connect Wallet"}
      </Box>

      {/* Wallet Options / History Modal */}
      <BitcoinBuyModal
        title="Decentralized Exchanges & Wallet Providers"
        links={bitcoinData[0]?.links || []}
        openModal={openWalletModal}
        handleCloseModal={() => setOpenWalletModal(false)}
      />
    </Box>
  );
};

export default Navigation;
