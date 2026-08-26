import { Stack } from "expo-router";
import Head from "expo-router/head";

export default function RootLayout() {
  return (
    <>
      <Head>
        <title>Smart Laundry</title>
        <meta
          name="description"
          content="Smart Laundry - Laundry in One Tap"
        />
      </Head>

      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </>
  );
}