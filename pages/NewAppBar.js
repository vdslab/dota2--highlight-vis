import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { FormControl, IconButton } from "@mui/material";
import { Box } from "@mui/system";
import MenuIcon from "@mui/icons-material/Menu";
import { styled, useTheme } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import { TextField } from "@mui/material";

export function NewAppBar({ keys, mins, maxs }) {
  const days = "2023/6-7-2023/7/7";
  function createData(id) {
    return { id };
  }

  const [menu, setMenu] = useState([400, 400]);
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [open, setOpen] = React.useState(false);
  const [heroListOpen, setHeroListOpen] = React.useState(false);

  const theme = useTheme();
  const selectStyles = {
    control: (styles) => ({ ...styles, margin: "1rem" }),
    option: (styles) => {
      return {
        ...styles,
      };
    },
  };
  const DrawerHeader = styled("div")(({ theme }) => ({
    background: "#1976d2",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  }));
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
          width: menu[0],
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: menu[0],
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
        <FormControl sx={{ pl: 3 }}>
          {keys.map((k, index) => {
            <MinMax text={k} min={mins[index]} max={maxs[index]} />;
          })}
        </FormControl>
        <TableContainer>
          <Table sx={{ minWidth: 400 }} aria-label="custom pagination table">
            <TableBody></TableBody>
          </Table>
        </TableContainer>
      </Drawer>
    </Box>
  );
}

function MinMax({ text, min, max }) {
  console.log("Hello");
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
        onChange={(event) => (min = event.target.value)}
        sx={{ marginTop: "1rem" }}
      />
      <TextField
        id="outlined-basic"
        label="max"
        variant="outlined"
        type={"number"}
        value={max}
        onChange={(event) => (max = event.target.value)}
        sx={{ marginTop: "1rem" }}
      />
    </div>
  );
}

export default function Home() {
  return <div></div>;
}
