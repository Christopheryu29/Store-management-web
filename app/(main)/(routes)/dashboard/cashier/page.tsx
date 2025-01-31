"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Button,
  Stack,
  Input,
  NumberInput,
  NumberInputField,
  HStack,
  Badge,
  useToast,
  Select,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { Id } from "@/convex/_generated/dataModel";

type InventoryItem = {
  name: string;
  itemId: string;
  price: number;
  stock: number;
};

type Store = {
  _id: Id<"stores">;
  name: string;
  inventory: InventoryItem[];
};

const CashierDashboard = () => {
  const toast = useToast();

  // Store login state
  const [storeName, setStoreName] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [credentials, setCredentials] = useState<{
    name: string;
    password: string;
  } | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Fetch store details using query
  const store = useQuery(
    api.stores.getStoreByCredentials,
    credentials
      ? { name: credentials.name, password: credentials.password }
      : "skip"
  );

  // Mutation for checkout
  const checkoutItem = useMutation(api.stores.checkoutItem);

  // Handle login
  const handleLogin = () => {
    if (!storeName || !storePassword) {
      toast({
        title: "Error",
        description: "Please enter both store name and password.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCredentials({ name: storeName, password: storePassword });
  };

  // Handle store data after successful query
  if (store && !currentStore) {
    setCurrentStore(store);
    toast({
      title: "Success",
      description: `Logged into store: ${store.name}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }

  // Filtered and searchable inventory
  const filteredInventory = useMemo(() => {
    if (!currentStore) return [];
    return currentStore.inventory
      .filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (item) =>
          item.price >= priceRange[0] &&
          item.price <= priceRange[1] &&
          (!lowStockOnly || item.stock <= 5)
      );
  }, [currentStore, searchTerm, priceRange, lowStockOnly]);

  // Handle checkout
  const handleCheckout = async (itemId: string, quantity: number) => {
    if (!currentStore) return;

    try {
      await checkoutItem({
        storeId: currentStore._id,
        itemId,
        quantity,
      });

      // Update UI locally
      setCurrentStore({
        ...currentStore,
        inventory: currentStore.inventory.map((item) =>
          item.itemId === itemId
            ? { ...item, stock: item.stock - quantity }
            : item
        ),
      });

      toast({
        title: "Success",
        description: "Checkout successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Checkout failed";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!currentStore) {
    return (
      <Box p={6}>
        <Heading size="lg" mb={4}>
          Cashier Dashboard
        </Heading>
        <Stack spacing={4}>
          <Input
            placeholder="Store Name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={storePassword}
            onChange={(e) => setStorePassword(e.target.value)}
          />
          <Button colorScheme="teal" onClick={handleLogin}>
            Login
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>
        {currentStore.name} - Inventory
      </Heading>

      {/* Search and Filters */}
      <Box mb={6} p={4} bg="gray.50" rounded="md" shadow="sm">
        <Stack spacing={4}>
          <Input
            placeholder="Search by item name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <HStack>
            <NumberInput
              value={priceRange[0]}
              min={0}
              onChange={(value) =>
                setPriceRange([Number(value), priceRange[1]])
              }
            >
              <NumberInputField placeholder="Min Price" />
            </NumberInput>
            <NumberInput
              value={priceRange[1] === Infinity ? "" : priceRange[1]}
              min={0}
              onChange={(value) =>
                setPriceRange([
                  priceRange[0],
                  value === "" ? Infinity : Number(value),
                ])
              }
            >
              <NumberInputField placeholder="Max Price" />
            </NumberInput>
          </HStack>
          <Button
            colorScheme={lowStockOnly ? "red" : "gray"}
            onClick={() => setLowStockOnly(!lowStockOnly)}
          >
            {lowStockOnly ? "Show All Items" : "Show Low Stock Only"}
          </Button>
        </Stack>
      </Box>

      {/* Inventory List */}
      <VStack align="stretch" spacing={4} mb={6}>
        {filteredInventory.map((item) => (
          <Box
            key={item.itemId}
            p={4}
            border="1px solid"
            borderColor="gray.300"
            rounded="md"
            shadow="md"
            bg="white"
          >
            <HStack justify="space-between">
              <Text fontWeight="bold">{item.name}</Text>
              {item.stock <= 5 && <Badge colorScheme="red">Low Stock</Badge>}
            </HStack>
            <Text fontSize="sm">Price: ${item.price.toFixed(2)}</Text>
            <Text fontSize="sm">Stock: {item.stock}</Text>
            <HStack mt={2}>
              <NumberInput
                defaultValue={1}
                min={1}
                max={item.stock}
                onChange={(value) => handleCheckout(item.itemId, Number(value))}
              >
                <NumberInputField placeholder="Quantity" />
              </NumberInput>
              <Button
                colorScheme="teal"
                size="sm"
                onClick={() => handleCheckout(item.itemId, 1)}
              >
                Checkout
              </Button>
            </HStack>
          </Box>
        ))}
        {filteredInventory.length === 0 && (
          <Text textAlign="center" color="gray.500">
            No items match your filters.
          </Text>
        )}
      </VStack>

      <Button colorScheme="blue" onClick={() => setCurrentStore(null)}>
        Logout
      </Button>
    </Box>
  );
};

export default CashierDashboard;
