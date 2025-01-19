"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
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
  useColorModeValue,
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
  name: string;
  inventory: InventoryItem[];
};

const StoreInventory = () => {
  const { storeId } = useParams();
  const router = useRouter();
  const toast = useToast();

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.300", "gray.600");
  const textColor = useColorModeValue("black", "white");

  // Ensure `storeId` is a string and convert it to Id<"stores">
  const storeIdAsId =
    storeId && typeof storeId === "string" ? (storeId as Id<"stores">) : null;

  // Fetch store details
  const store = useQuery(
    api.stores.getStoreById,
    storeIdAsId ? { storeId: storeIdAsId } : "skip"
  ) as Store | null;

  // Mutations
  const addInventoryItem = useMutation(api.stores.addInventoryItem);
  const deleteInventoryItem = useMutation(api.stores.deleteInventoryItem);
  const updateInventoryItem = useMutation(api.stores.updateInventoryItem);

  // States
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState<number | undefined>(undefined);
  const [itemStock, setItemStock] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered and sorted inventory items
  const filteredInventory = useMemo(() => {
    const filtered = store?.inventory
      .filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (item) =>
          item.price >= priceRange[0] &&
          item.price <= priceRange[1] &&
          (!lowStockOnly || item.stock <= 5)
      );

    if (filtered) {
      return filtered.sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "price") return a.price - b.price;
        if (sortBy === "stock") return a.stock - b.stock;
        return 0;
      });
    }

    return [];
  }, [store, searchTerm, priceRange, lowStockOnly, sortBy]);

  const paginatedInventory = useMemo(() => {
    return filteredInventory.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredInventory, currentPage]);

  // Add new inventory item
  const handleAddItem = async () => {
    if (!itemName || itemPrice === undefined || itemStock === undefined) {
      toast({
        title: "Error",
        description: "Please fill out all fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (store?.inventory.some((item) => item.name === itemName)) {
      toast({
        title: "Error",
        description: "An item with this name already exists.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addInventoryItem({
        storeId: storeIdAsId!,
        name: itemName,
        price: itemPrice,
        stock: itemStock,
      });

      setItemName("");
      setItemPrice(undefined);
      setItemStock(undefined);

      toast({
        title: "Success",
        description: "Inventory item added successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to add inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to add inventory item.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete inventory item
  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteInventoryItem({ storeId: storeIdAsId!, itemId });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to delete inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Update inventory item
  const handleEditItem = async () => {
    if (!editingItem) return;

    try {
      await updateInventoryItem({
        storeId: storeIdAsId!,
        itemId: editingItem.itemId,
        name: editingItem.name,
        price: editingItem.price,
        stock: editingItem.stock,
      });

      setEditingItem(null);

      toast({
        title: "Success",
        description: "Inventory item updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to update inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory item.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!store) {
    return (
      <Box p={6} textAlign="center">
        <Spinner size="lg" />
        <Text mt={4}>Loading store inventory...</Text>
      </Box>
    );
  }

  return (
    <Box p={6} bg={bg} color={textColor}>
      <Heading size="lg" mb={4}>
        {store.name} Inventory
      </Heading>

      {/* Search, Filter, and Sorting */}
      <Box mb={6} p={4} bg="gray.50" rounded="md" shadow="sm">
        <Stack spacing={4}>
          <Input
            placeholder="Search by name"
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
          <HStack justify="space-between">
            <Button
              colorScheme={lowStockOnly ? "red" : "gray"}
              onClick={() => setLowStockOnly(!lowStockOnly)}
            >
              {lowStockOnly ? "Show All Items" : "Show Low Stock Only"}
            </Button>
            <Select
              placeholder="Sort by"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "price" | "stock")
              }
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
            </Select>
          </HStack>
        </Stack>
      </Box>

      {/* Pagination */}
      <HStack justify="space-between" mb={4}>
        <Button
          onClick={() => setCurrentPage((prev) => prev - 1)}
          isDisabled={currentPage === 1}
        >
          Previous
        </Button>
        <Text>Page {currentPage}</Text>
        <Button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          isDisabled={currentPage * itemsPerPage >= filteredInventory.length}
        >
          Next
        </Button>
      </HStack>

      {/* Inventory List */}
      <VStack align="stretch" spacing={4} mb={6}>
        {paginatedInventory.map((item) => (
          <Box
            key={item.itemId}
            p={4}
            border="1px solid"
            borderColor={borderColor}
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
            <HStack mt={2} justify="flex-end">
              <Button
                size="sm"
                colorScheme="yellow"
                onClick={() => setEditingItem(item)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => handleDeleteItem(item.itemId)}
              >
                Delete
              </Button>
            </HStack>
          </Box>
        ))}
        {paginatedInventory.length === 0 && (
          <Text textAlign="center" color="gray.500">
            No items match your filters.
          </Text>
        )}
      </VStack>

      {/* Edit Form */}
      {editingItem && (
        <Box
          p={4}
          border="1px solid"
          borderColor={borderColor}
          rounded="md"
          shadow="md"
          bg="white"
        >
          <Heading size="md" mb={4}>
            Edit Inventory Item
          </Heading>
          <Stack spacing={4}>
            <Input
              placeholder="Item Name"
              value={editingItem.name}
              onChange={(e) =>
                setEditingItem({ ...editingItem, name: e.target.value })
              }
            />
            <NumberInput
              value={editingItem.price}
              onChange={(value) =>
                setEditingItem({ ...editingItem, price: Number(value) })
              }
              precision={2}
              min={0}
            >
              <NumberInputField placeholder="Price" />
            </NumberInput>
            <NumberInput
              value={editingItem.stock}
              onChange={(value) =>
                setEditingItem({ ...editingItem, stock: Number(value) })
              }
              min={0}
            >
              <NumberInputField placeholder="Stock" />
            </NumberInput>
            <Button colorScheme="teal" onClick={handleEditItem}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
          </Stack>
        </Box>
      )}

      {/* Add Inventory Form */}
      <Box
        p={4}
        border="1px solid"
        borderColor={borderColor}
        rounded="md"
        shadow="md"
        bg="white"
      >
        <Heading size="md" mb={4}>
          Add New Inventory Item
        </Heading>
        <Stack spacing={4}>
          <Input
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <NumberInput
            value={itemPrice}
            onChange={(value) => setItemPrice(Number(value))}
            precision={2}
            min={0}
          >
            <NumberInputField placeholder="Price" />
          </NumberInput>
          <NumberInput
            value={itemStock}
            onChange={(value) => setItemStock(Number(value))}
            min={0}
          >
            <NumberInputField placeholder="Stock" />
          </NumberInput>
          <Button
            colorScheme="teal"
            isLoading={isSubmitting}
            onClick={handleAddItem}
            disabled={isSubmitting}
          >
            Add Item
          </Button>
        </Stack>
      </Box>

      <Stack mt={6}>
        <Button
          colorScheme="blue"
          onClick={() => router.push("/dashboard/owner")}
        >
          Back to Dashboard
        </Button>
      </Stack>
    </Box>
  );
};

export default StoreInventory;
