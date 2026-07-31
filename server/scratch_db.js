import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false, collection: 'projects' }));
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const projects = await Project.find({});
  for (const p of projects) {
    if (p.members && p.members.length > 0) {
      const validMembers = [];
      for (const mId of p.members) {
        const u = await User.findById(mId);
        if (u) validMembers.push(mId);
      }
      if (validMembers.length !== p.members.length) {
        p.members = validMembers;
        await p.save();
        console.log(`Cleaned up project ${p._id}`);
      }
    }
  }
  
  console.log("Cleanup complete.");
  mongoose.disconnect();
}
run();
