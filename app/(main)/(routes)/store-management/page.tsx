"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button, Box, Text, Stack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const StoreManagement = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();

  // Fetch user data using the function reference
  const userData = useQuery(api.users.getUser); // Correct function reference
  const assignRoleMutation = useMutation(api.users.assignRole); // Correct function reference

  // Handle role selection
  const handleRoleSelection = async (role: "owner" | "cashier") => {
    await assignRoleMutation({ role }); // Use the mutation
    router.push(role === "owner" ? "/dashboard/owner" : "/dashboard/cashier");
  };

  // Redirect if the user already has a role
  useEffect(() => {
    if (userData?.role) {
      router.push(
        userData.role === "owner" ? "/dashboard/owner" : "/dashboard/cashier"
      );
    }
  }, [userData, router]);

  // Show loading state if Convex auth or userData is still loading
  if (isLoading || userData === undefined) {
    return <Text>Loading...</Text>;
  }

  // If user data is null, prompt for role assignment
  if (!userData) {
    return (
      <Box textAlign="center" mt={8}>
        <Text fontSize="lg" mb={4}>
          Welcome! Please select your role:
        </Text>
        <Stack direction="row" spacing={4} justify="center">
          <Button
            colorScheme="teal"
            onClick={() => handleRoleSelection("owner")}
          >
            I'm an Owner
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => handleRoleSelection("cashier")}
          >
            I'm a Cashier
          </Button>
        </Stack>
      </Box>
    );
  }

  return null; // Ensure no unintended rendering
};

export default StoreManagement;
