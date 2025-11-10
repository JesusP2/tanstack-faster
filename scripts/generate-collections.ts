import dotenv from 'dotenv';
import { Effect, Schedule } from 'effect';
import slugify from 'slugify';
import { ulid } from 'ulidx';
import { db } from '@/db';
import { collections } from '@/db/schema';

dotenv.config({
  path: './.env',
});

const collectionsDummyData = [
  { id: 1, name: 'Indoor', slug: 'indoor' },
  { id: 2, name: 'Outdoor', slug: 'outdoor' },
  { id: 3, name: 'Kitchen', slug: 'kitchen' },
  { id: 4, name: 'Bedroom', slug: 'bedroom' },
  { id: 5, name: 'Bathroom', slug: 'bathroom' },
  { id: 6, name: 'Office', slug: 'office' },
  { id: 7, name: 'Kids', slug: 'kids' },
  { id: 8, name: 'Pets', slug: 'pets' },
  { id: 9, name: 'Sports', slug: 'sports' },
  { id: 10, name: 'Fitness', slug: 'fitness' },
  { id: 11, name: 'Fashion', slug: 'fashion' },
  { id: 12, name: 'Shoes', slug: 'shoes' },
  { id: 13, name: 'Accessories', slug: 'accessories' },
  { id: 14, name: 'Jewelry', slug: 'jewelry' },
  { id: 15, name: 'Watches', slug: 'watches' },
  { id: 16, name: 'Beauty', slug: 'beauty' },
  { id: 17, name: 'Skincare', slug: 'skincare' },
  { id: 18, name: 'Haircare', slug: 'haircare' },
  { id: 19, name: 'Makeup', slug: 'makeup' },
  { id: 20, name: 'Fragrances', slug: 'fragrances' },
  { id: 21, name: 'Electronics', slug: 'electronics' },
  { id: 22, name: 'Computers', slug: 'computers' },
  { id: 23, name: 'Phones', slug: 'phones' },
  { id: 24, name: 'Tablets', slug: 'tablets' },
  { id: 25, name: 'Audio', slug: 'audio' },
  { id: 26, name: 'Cameras', slug: 'cameras' },
  { id: 27, name: 'Gaming', slug: 'gaming' },
  { id: 28, name: 'TVs', slug: 'tvs' },
  { id: 29, name: 'Appliances', slug: 'appliances' },
  { id: 30, name: 'Vacuums', slug: 'vacuums' },
  { id: 31, name: 'Lighting', slug: 'lighting' },
  { id: 32, name: 'Tools', slug: 'tools' },
  { id: 33, name: 'Gardening', slug: 'gardening' },
  { id: 34, name: 'Plants', slug: 'plants' },
  { id: 35, name: 'Decor', slug: 'decor' },
  { id: 36, name: 'Rugs', slug: 'rugs' },
  { id: 37, name: 'Curtains', slug: 'curtains' },
  { id: 38, name: 'Throw Pillows', slug: 'throw-pillows' },
  { id: 39, name: 'Wall Art', slug: 'wall-art' },
  { id: 40, name: 'Mirrors', slug: 'mirrors' },
  { id: 41, name: 'Storage', slug: 'storage' },
  { id: 42, name: 'Shelving', slug: 'shelving' },
  { id: 43, name: 'Baskets', slug: 'baskets' },
  { id: 44, name: 'Hooks', slug: 'hooks' },
  { id: 45, name: 'Laundry', slug: 'laundry' },
  { id: 46, name: 'Cleaning', slug: 'cleaning' },
  { id: 47, name: 'Paper Goods', slug: 'paper-goods' },
  { id: 48, name: 'Party Supplies', slug: 'party-supplies' },
  { id: 49, name: 'Gifts', slug: 'gifts' },
  { id: 50, name: 'Stationery', slug: 'stationery' },
  { id: 51, name: 'Books', slug: 'books' },
  { id: 52, name: 'Music', slug: 'music' },
  { id: 53, name: 'Movies', slug: 'movies' },
  { id: 54, name: 'Hobbies', slug: 'hobbies' },
  { id: 55, name: 'Crafts', slug: 'crafts' },
  { id: 56, name: 'Sewing', slug: 'sewing' },
  { id: 57, name: 'Knitting', slug: 'knitting' },
  { id: 58, name: 'Painting', slug: 'painting' },
  { id: 59, name: 'Sculpting', slug: 'sculpting' },
  { id: 60, name: 'Pottery', slug: 'pottery' },
  { id: 61, name: 'Lego', slug: 'lego' },
  { id: 62, name: 'Board Games', slug: 'board-games' },
  { id: 63, name: 'Puzzles', slug: 'puzzles' },
  { id: 64, name: 'Cards', slug: 'cards' },
  { id: 65, name: 'Toys', slug: 'toys' },
  { id: 66, name: 'Dolls', slug: 'dolls' },
  { id: 67, name: 'Action Figures', slug: 'action-figures' },
  { id: 68, name: 'Remote Control', slug: 'remote-control' },
  { id: 69, name: 'STEM', slug: 'stem' },
  { id: 70, name: 'Bikes', slug: 'bikes' },
  { id: 71, name: 'Scooters', slug: 'scooters' },
  { id: 72, name: 'Skates', slug: 'skates' },
  { id: 73, name: 'Outdoor Games', slug: 'outdoor-games' },
  { id: 74, name: 'Camping', slug: 'camping' },
  { id: 75, name: 'Fishing', slug: 'fishing' },
  { id: 76, name: 'Hunting', slug: 'hunting' },
  { id: 77, name: 'Boating', slug: 'boating' },
  { id: 78, name: 'Climbing', slug: 'climbing' },
  { id: 79, name: 'Skiing', slug: 'skiing' },
  { id: 80, name: 'Snowboarding', slug: 'snowboarding' },
  { id: 81, name: 'Surfing', slug: 'surfing' },
  { id: 82, name: 'Diving', slug: 'diving' },
  { id: 83, name: 'Snorkeling', slug: 'snorkeling' },
  { id: 84, name: 'Swimming', slug: 'swimming' },
  { id: 85, name: 'Running', slug: 'running' },
  { id: 86, name: 'Cycling', slug: 'cycling' },
  { id: 87, name: 'Triathlon', slug: 'triathlon' },
  { id: 88, name: 'Yoga', slug: 'yoga' },
  { id: 89, name: 'Pilates', slug: 'pilates' },
  { id: 90, name: 'Martial Arts', slug: 'martial-arts' },
  { id: 91, name: 'Boxing', slug: 'boxing' },
  { id: 92, name: 'Weightlifting', slug: 'weightlifting' },
  { id: 93, name: 'CrossFit', slug: 'crossfit' },
  { id: 94, name: 'Dance', slug: 'dance' },
  { id: 95, name: 'Cheer', slug: 'cheer' },
  { id: 96, name: 'Skateboarding', slug: 'skateboarding' },
  { id: 97, name: 'Parkour', slug: 'parkour' },
  { id: 98, name: 'Travel', slug: 'travel' },
  { id: 99, name: 'Luggage', slug: 'luggage' },
  { id: 100, name: 'Backpacks', slug: 'backpacks' },
];

const main = Effect.gen(function* () {
  yield* Effect.all(
    collectionsDummyData.map((collection) =>
      Effect.tryPromise(() =>
        db.insert(collections).values({
          id: ulid(),
          name: collection.name,
          slug: slugify(collection.name, { lower: true }),
        })
      ).pipe(Effect.catchAll((_) => Effect.void))
    )
  );
});

const exit = await Effect.runPromiseExit(
  main.pipe(Effect.retry({ schedule: Schedule.spaced('1 seconds') }))
);
console.log(exit.toString());
