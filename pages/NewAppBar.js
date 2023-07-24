import * as React from "react";
import { useEffect, useRef, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { FormControl, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import MenuIcon from "@mui/icons-material/Menu";
import { styled, useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import { TextField } from "@mui/material";

export function NewAppBar({ keysList, keyValues, setKeyValues }) {
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [open, setOpen] = React.useState(false);

  const theme = useTheme();
  const DrawerHeader = styled("div")(({ theme }) => ({
    background: "#1976d2",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  }));
  useEffect(() => {});
  return (
    <Box
      sx={{ display: "flex", border: "1px solid" }}
      border={4}
      borderColor="primary.main"
    >
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{ marginLeft: "auto", marginRight: "auto" }}
          >
            Dota2 highlight vis
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: 400,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 400,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "ltr" ? (
              <ChevronLeftIcon />
            ) : (
              <ChevronRightIcon />
            )}
          </IconButton>
        </DrawerHeader>
        {keysList.map((k, index) => {
          return (
            <MinMax
              key={k}
              text={k}
              min={keyValues[index][0]}
              max={keyValues[index][1]}
              index={index}
              keyValues={keyValues}
              setKeyValues={setKeyValues}
            ></MinMax>
          );
        })}
        <FormControl sx={{ pl: 3 }}></FormControl>
        <TableContainer>
          <Table sx={{ minWidth: 400 }} aria-label="custom pagination table">
            <TableBody></TableBody>
          </Table>
        </TableContainer>
      </Drawer>
    </Box>
  );
}

function MinMax({ text, min, max, index, keyValues, setKeyValues }) {
  const [x, setX] = useState(0);
  return (
    <div>
      <Typography
        variant="h6"
        noWrap
        component="div"
        sx={{ marginTop: "2rem" }}
      >
        {text}
      </Typography>
      <TextField
        id="outlined-basic"
        label="min"
        variant="outlined"
        type={"number"}
        value={min}
        onChange={(event) => {
          setKeyValues(
            keyValues.map((k, i) => {
              return index === i
                ? [Number(event.target.value), k[1]]
                : [k[0], k[1]];
            })
          );
        }}
        sx={{ marginTop: "1rem" }}
      />
      <TextField
        id="outlined-basic"
        label="max"
        variant="outlined"
        type={"number"}
        value={max}
        onChange={(event) => {
          setKeyValues(
            keyValues.map((k, i) => {
              return index === i
                ? [k[0], Number(event.target.value)]
                : [k[0], k[1]];
            })
          );
        }}
        sx={{ marginTop: "1rem" }}
      />
    </div>
  );
}

export default function Home() {
  return <div></div>;
}
