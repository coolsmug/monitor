const Staff = require("../models/staff");

/**
 * 🧮 Euclidean distance between two face embeddings
 */
function euclideanDistance(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * 🔍 Find the closest matching staff using stored face embeddings
 */
async function findStaffByFace(inputEmbedding) {
  try {
    if (!inputEmbedding || !Array.isArray(inputEmbedding)) {
      console.warn(" Invalid embedding provided");
      return null;
    }

    // Get all staff that already have a saved embedding
    const allStaff = await Staff.find({
      faceEmbedding: { $exists: true, $ne: [] },
    });

    if (!allStaff.length) {
      console.warn("No staff with registered embeddings found");
      return null;
    }

    let closestStaff = null;
    let smallestDistance = Infinity;

    // Smaller threshold = stricter match (0.4–0.6 typical for 128-d embeddings)
    const THRESHOLD = 0.45;

    for (const staff of allStaff) {
      const distance = euclideanDistance(staff.faceEmbedding, inputEmbedding);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestStaff = staff;
      }
    }

    if (closestStaff && smallestDistance <= THRESHOLD) {
      console.log(
        `Matched ${closestStaff.name} (distance: ${smallestDistance.toFixed(3)})`
      );
      return closestStaff;
    }

    console.log(
      ` No match found. Smallest distance: ${smallestDistance.toFixed(3)}`
    );
    return null;
  } catch (error) {
    console.error(" Error in findStaffByFace:", error);
    return null;
  }
}

/**
 *  Optional cosine similarity helper (for experimentation)
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (normA * normB);
}

module.exports = {
  findStaffByFace,
  euclideanDistance,
  cosineSimilarity, // optional helper export
};
