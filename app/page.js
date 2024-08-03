'use client';
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
  const [itemCategory, setItemCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch and update inventory data
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = docs.docs.map(doc => ({
      name: doc.id,
      ...doc.data(),
    }));
    setInventory(inventoryList);
  };

  // Add new item or update existing item
  const addItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, category: itemCategory });
    } else {
      await setDoc(docRef, { quantity: 1, category: itemCategory });
    }
    await updateInventory();
  };

  // Remove item or decrease its quantity
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

  // Handlers for opening and closing the modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setItemName('');
    setItemCategory('');
    setOpen(false);
  };

  // Handle search input change
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // Filter inventory based on search query
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        minHeight="100vh"
        display="flex"
        flexDirection="column"
        p={2}
        gap={2}
        sx={{
          p: { xs: '1rem', md: '2rem', lg: '3rem' },
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
              width: { xs: '90%', md: '70%', lg: '50%' },
              padding: { xs: '1rem', md: '2rem', lg: '3rem' },
            }}
          >
            <Typography variant="h6">Add Item</Typography>
            <Stack width="100%" direction="column" spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                variant="outlined"
                fullWidth
                label="Category"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem();
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Box
          display="flex"
          flexDirection="row"
          gap={2}
          width="100%"
          flex={1}
          sx={{
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Box
            width="100%"
            maxWidth="400px"
            p={2}
            borderRadius={1}
            display="flex"
            flexDirection="column"
            gap={2}
            sx={{
              maxWidth: { xs: '100%', md: '400px' },
            }}
          >
            <Box
              bgcolor="#ADD8E6"
              p={2}
              borderRadius={1}
              mb={2}
            >
              <Typography variant="h4" color="#333" sx={{
                fontSize: { xs: '1.5rem', md: '2rem', lg: '2.5rem' },
                textAlign: { xs: 'center', md: 'left' },
              }}>
                Inventory Tracker
              </Typography>
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search items..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ mb: '1rem' }}
            />
            <Button
              variant="contained"
              onClick={handleOpen}
              sx={{
                backgroundColor: purple[500],
                width: '100%',
                height: '50px',
                mb: '2rem',
                '&:hover': {
                  backgroundColor: purple[700],
                },
              }}
            >
              Add New Items
            </Button>
          </Box>
          <Box
            flex={1}
            p={2}
            sx={{
              overflowY: 'auto',
              maxHeight: { xs: 'auto', md: 'calc(100vh - 200px)' },
            }}
          >
            <Typography variant="h2" color="#333" mb={2} sx={{ p: 2, borderRadius: 1 }}>
              Updated Inventory
            </Typography>
            {filteredInventory.map(({ name, quantity }) => (
              <Grid container key={name} spacing={1} alignItems="center" bgcolor="#f0f0f0" p={2} borderRadius={1} sx={{ mb: '1rem' }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6">{name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6} container justifyContent="flex-end">
                  <Typography variant="h6">Quantity: {quantity}</Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeItem(name)}
                    sx={{ ml: 2 }}
                  >
                    Remove
                  </Button>
                </Grid>
              </Grid>
            ))}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

