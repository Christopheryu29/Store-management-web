"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Store = {
  _id: string;
  name: string;
  totalSales: number;
  debt: number;
  inventory: { name: string; itemId: string; price: number; stock: number }[];
};

const OwnerDashboard = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  // Fetch stores and user data
  const ownedStores = useQuery(api.users.getStoresByOwner) as
    | Store[]
    | undefined;
  const userData = useQuery(api.users.getUser); // Fetch user data
  const addStoreMutation = useMutation(api.users.addStore);

  // State for the new store form
  const [storeName, setStoreName] = useState("");
  const [storePassword, setStorePassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if user is not an owner
  useEffect(() => {
    if (!isLoading && userData?.role !== "owner") {
      router.push("/"); // Redirect to the homepage or another appropriate page
    }
  }, [isLoading, userData, router]);

  // Handle adding a new store
  const handleAddStore = async () => {
    if (!storeName || !storePassword) {
      setError("Please provide both store name and password.");
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      await addStoreMutation({ name: storeName, password: storePassword });

      // Clear input fields
      setStoreName("");
      setStorePassword("");
    } catch (error) {
      console.error("Failed to add store:", error);
      setError("Failed to add store. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  // Handle clicking on a store
  const handleStoreClick = (storeId: string) => {
    router.push(`/dashboard/owner/store/${storeId}`); // Navigate to the inventory page
  };

  // Show loading state while fetching data
  if (isLoading || ownedStores === undefined) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="lg" />
        <Text mt={4}>Loading your dashboard...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>
        Owner Dashboard
      </Heading>

      {/* Error Display */}
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* List of owned stores */}
      <VStack align="stretch" spacing={4} mb={6}>
        <Heading size="md" mb={2}>
          {ownedStores.length > 0
            ? "Your Stores"
            : "You don't own any stores yet. Add one below."}
        </Heading>
        {ownedStores.length > 0 ? (
          ownedStores.map((store) => (
            <Box
              key={store._id}
              p={4}
              border="1px solid"
              borderColor="gray.300"
              rounded="md"
              shadow="md"
              bg="white"
              cursor="pointer"
              onClick={() => handleStoreClick(store._id)} // Navigate on click
              _hover={{ bg: "gray.100" }}
            >
              <Text fontWeight="bold">{store.name}</Text>
              <Text fontSize="sm">Store ID: {store._id}</Text>
              <Text fontSize="sm">
                Total Sales: ${store.totalSales.toFixed(2)}
              </Text>
              <Text fontSize="sm">Debt: ${store.debt.toFixed(2)}</Text>
            </Box>
          ))
        ) : (
          <Text>No stores found. Add a new store below.</Text>
        )}
      </VStack>

      {/* Add new store */}
      <Heading size="md" mb={2}>
        Add New Store
      </Heading>
      <Stack direction="column" spacing={4} maxW="400px">
        <Input
          placeholder="Store Name"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          isDisabled={isAdding}
        />
        <Input
          placeholder="Store Password"
          type="password"
          value={storePassword}
          onChange={(e) => setStorePassword(e.target.value)}
          isDisabled={isAdding}
        />
        <Button
          colorScheme="teal"
          isLoading={isAdding}
          onClick={handleAddStore}
          disabled={isAdding || !storeName || !storePassword}
        >
          Add Store
        </Button>
      </Stack>
    </Box>
  );
};

export default OwnerDashboard;
