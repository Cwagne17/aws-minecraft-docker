#!/usr/bin/env node
import worlds = require("../../worlds.json");
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MinecraftStack } from '../lib/minecraft-stack';

const app = new cdk.App();

/**
 * The type being enforce in the worlds.json file.
 */
interface World {
  modpack: string;
  java_version: string;
  minecraft_version: string;
  memory: number;
  cpu: number;
}

for(const world of worlds as World[]) {
  new MinecraftStack(app, world.modpack ?? "MinecraftWorld", {
    description: `Minecraft world for ${world.modpack}`,
    modpack: world.modpack,
    javaVersion: world.java_version,
    minecraftVersion: world.minecraft_version,
    memory: world.memory,
    cpu: world.cpu,
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  });
}



