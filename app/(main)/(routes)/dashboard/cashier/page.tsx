"use client";

import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { Box, Text, Stack } from "@chakra-ui/react";

const CashierDashboard = () => {
  const { user } = useConvexAuth();
  const stores = useQuery("getStoresByCashier", { userId: user?.id });

  return (
    <Box p={4}>
      <Text fontSize="xl" mb={4}>
        Assigned Stores
      </Text>
      <Stack spacing={4}>
        {stores?.map((store) => (
          <Box key={store.storeId} p={4} borderWidth={1}>
            <Text>{store.name}</Text>
            <Text>Inventory:</Text>
            {store.inventory.map((item) => (
              <Text key={item.itemId}>
                {item.name} - ${item.price} - {item.stock} in stock
              </Text>
            ))}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default CashierDashboard;
