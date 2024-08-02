'use client'
import Image from 'next/image';
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button, Grid } from '@mui/material';
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore';

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

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: 'translate(-50%, -50%)',
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
        width="800px"
        height="100px"
        bgcolor="#ADD8E6"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="h2" color="#333">
          Inventory Tracker
        </Typography>
      </Box>
      <Box width="800px" mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search items..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </Box>
      <Box
        width="800px"
        maxHeight="450px" // Height set to show 3 items (each around 150px)
        overflow="auto" // Enable scrolling if content exceeds maxHeight
      >
        {filteredInventory.map(({ name, quantity }) => (
          <Grid container key={name} spacing={2} alignItems="center" bgcolor="#f0f0f0" p={2} borderRadius={1}>
            <Grid item xs={6}>
              <Typography variant="h5" color="#333">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="h5" color="#333">
                Quantity: {quantity}
              </Typography>
            </Grid>
            <Grid item xs={3} display="flex" justifyContent="flex-end">
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

            </Grid>
          </Grid>
        ))}
      </Box>
      <Button
        variant="contained"
        onClick={handleOpen}
        sx={{
          backgroundColor: '#4682b4',
          width: '200px',
          height: '50px',
          '&:hover': {
            backgroundColor: '#4169e1'
          }
        }}
      >
        Add New Items
      </Button>
    </Box>
  );
}

