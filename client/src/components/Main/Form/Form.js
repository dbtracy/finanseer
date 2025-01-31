import React, { useState, useContext } from "react";
import {
  TextField,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { createMuiTheme, ThemeProvider, Collapse } from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import Snackbar from "../Snackbar/Snackbar";
import formatDate from "../../../utils/formatDate";
import { ExpenseTrackerContext } from "../../../context/context";
import {
  incomeCategories,
  expenseCategories,
} from "../../../constants/categories";
import backend from "../../../utils/backend";
import useStyles from "./styles";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "rgba(121,9,113,1)",
    },
  },
});

const initialState = {
  amount: "",
  category: "",
  type: "Income",
  timestamp: new Date().getTime()
};

const Form = () => {
  const classes = useStyles();
  const { addTransaction } = useContext(ExpenseTrackerContext);
  const [formData, setFormData] = useState(initialState);
  const [open, setOpen] = useState(false);
  const [alert, revealAlert] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const createTransaction = () => {
    if (
      formData.amount !== 0 &&
      formData.category !== "" &&
      formData.type !== ""
    ) {
      if (Number.isNaN(Number(formData.amount))) {
        setErrMsg("Input must be number");
        revealAlert(true);
        return;
      } else if (formData.amount < 0) {
        setErrMsg("Input cannot be negative");
        revealAlert(true);
        return;
      }
      revealAlert(false);

      if (incomeCategories.map((iC) => iC.type).includes(formData.category)) {
        setFormData({ ...formData, type: "Income" });
      } else if (
        expenseCategories.map((iC) => iC.type).includes(formData.category)
      ) {
        setFormData({ ...formData, type: "Expense" });
      }

      setOpen(true);

      const itemData = {
        ...formData,
        amount: Number(formData.amount)
      };

      addTransaction(itemData);
      backend.post(`/api/finance/${ formData.type }`, itemData);
      setFormData(initialState);
    }
  };

  const selectedCategories =
    formData.type === "Income" ? incomeCategories : expenseCategories;

  return (
    <Grid container spacing={2} className={classes.form}>
      <Snackbar open={open} setOpen={setOpen} />
      <ThemeProvider theme={theme}>
        <Grid item xs={6} className={classes.input}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <MenuItem value="Income">Income</MenuItem>
              <MenuItem value="Expense">Expense</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              {selectedCategories.map((c) => (
                <MenuItem key={c.type} value={c.type}>
                  {c.type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} className={classes.input}>
          <TextField
            type="number"
            label="Amount"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={formatDate(formData.timestamp)}
            onChange={(e) =>
              setFormData({ ...formData, timestamp: new Date(e.target.value).getTime() })
            }
          />
        </Grid>
        <Collapse in={alert} className={classes.negAlert}>
          <Alert severity="warning" >{errMsg}</Alert>
        </Collapse>
        <Button
          className={classes.button}
          variant="outlined"
          color="primary"
          fullWidth
          onClick={createTransaction}
        >
          Create
        </Button>
      </ThemeProvider>
    </Grid>
  );
};

export default Form;
