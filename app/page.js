'use client'
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button, Grid } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore';
import { purple } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter the inventory based on the search query
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create a theme to use breakpoints for responsive design
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        p={2}
        gap={2}
        sx={{
          [theme.breakpoints.down('sm')]: {
            p: '1rem',
          },
        }}
      >
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width="90%"
            maxWidth={400}
            bgcolor="white"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: 'translate(-50%, -50%)',
              [theme.breakpoints.down('sm')]: {
                width: '90%',
                padding: '1rem',
              },
            }}
          >
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="row" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                }}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Box
          width="100%"
          maxWidth="800px"
          height="auto"
          bgcolor="#ADD8E6"
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            mb: '2rem', // Space below title
            p: 2,
            borderRadius: 1,
            [theme.breakpoints.down('sm')]: {
              height: 'auto',
            },
          }}
        >
          <Typography variant="h2" color="#333" sx={{
            [theme.breakpoints.down('sm')]: {
              fontSize: '1.5rem',
              textAlign: 'center',
            },
          }}>
            Inventory Tracker
          </Typography>
        </Box>
        <Box width="100%" maxWidth="800px" mb={2}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search items..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              mb: '1rem', // Space below search bar
            }}
          />
        </Box>
        <Box
          width="100%"
          maxWidth="800px"
          maxHeight="450px"
          overflow="auto"
          sx={{
            [theme.breakpoints.down('sm')]: {
              maxHeight: 'auto',
            },
          }}
        >
          {filteredInventory.map(({ name, quantity }) => (
            <Grid container key={name} spacing={2} alignItems="center" bgcolor="#f0f0f0" p={2} borderRadius={1} sx={{
              mb: '1rem', // Space between items
              [theme.breakpoints.down('sm')]: {
                flexDirection: 'column',
                p: 1,
                gap: 1,
              },
            }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" color="#333" sx={{
                  [theme.breakpoints.down('sm')]: {
                    fontSize: '1rem',
                    textAlign: 'center',
                  },
                }}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} display="flex" justifyContent="space-between" sx={{
                [theme.breakpoints.down('sm')]: {
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                },
              }}>
                <Typography variant="h5" color="#333" sx={{
                  [theme.breakpoints.down('sm')]: {
                    fontSize: '1rem',
                    textAlign: 'center',
                  },
                }}>
                  Quantity: {quantity}
                </Typography>
                <Box display="flex" justifyContent="center" gap={1}>
                  <Button variant="contained" onClick={() => addItem(name)} sx={{ marginRight: 1 }}>
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => removeItem(name)}
                    sx={{
                      backgroundColor: '#b71c1c',
                      '&:hover': {
                        backgroundColor: '#c62828',
                      }
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              </Grid>
            </Grid>
          ))}
        </Box>
        <Button
          variant="contained"
          onClick={handleOpen}
          sx={{
            backgroundColor: purple,
            width: '200px',
            height: '50px',
            mt: '2rem', // Space above button
            '&:hover': {
              backgroundColor: '#4169e1'
            },
            [theme.breakpoints.down('sm')]: {
              width: '100%',
              height: 'auto',
              padding: '1rem',
            },
          }}
        >
          Add New Items
        </Button>
      </Box>
    </ThemeProvider>
  );
}
