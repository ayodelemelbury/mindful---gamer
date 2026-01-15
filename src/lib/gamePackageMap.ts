import type { Game } from "../types"
import { searchGames, type RAWGGame } from "./rawg"
import { getVerifiedMappings } from "./packageMappingService"

let communityMappingsCache: Map<string, string> | null = null

export async function loadCommunityMappings(): Promise<void> {
  try {
    communityMappingsCache = await getVerifiedMappings()
    console.log(
      `[GamePackageMap] Loaded ${communityMappingsCache.size} community mappings`
    )
  } catch (error) {
    console.warn("[GamePackageMap] Failed to load community mappings:", error)
  }
}

export function getCommunityMappingsSync(): Map<string, string> {
  return communityMappingsCache || new Map()
}

const GAME_PACKAGES: Record<string, string> = {
  // ==================== Supercell ====================
  "com.supercell.clashofclans": "Clash of Clans",
  "com.supercell.clashroyale": "Clash Royale",
  "com.supercell.brawlstars": "Brawl Stars",
  "com.supercell.boombeach": "Boom Beach",
  "com.supercell.hayday": "Hay Day",
  "com.supercell.squad.busters": "Squad Busters",
  "com.supercell.laser": "Laser Grid",

  // ==================== King (Candy Crush) ====================
  "com.king.candycrushsaga": "Candy Crush Saga",
  "com.king.candycrushsodasaga": "Candy Crush Soda Saga",
  "com.king.candycrushjellysaga": "Candy Crush Jelly Saga",
  "com.king.candycrushfriends": "Candy Crush Friends Saga",
  "com.king.farmheroessaga": "Farm Heroes Saga",
  "com.king.bubblewitch3": "Bubble Witch 3 Saga",
  "com.king.petrescuesaga": "Pet Rescue Saga",
  "com.king.alphabettysaga": "AlphaBetty Saga",

  // ==================== Tencent / PUBG ====================
  "com.tencent.ig": "PUBG Mobile",
  "com.pubg.krmobile": "PUBG Mobile KR",
  "com.vng.pubgmobile": "PUBG Mobile VN",
  "com.tencent.tmgp.pubgmhd": "PUBG Mobile Lite",
  "com.pubg.newstate": "PUBG: New State",
  "com.tencent.lolm": "League of Legends: Wild Rift",
  "com.tencent.tmgp.sgame": "Honor of Kings",

  // ==================== miHoYo / HoYoverse ====================
  "com.miHoYo.GenshinImpact": "Genshin Impact",
  "com.HoYoverse.hkrpgoversea": "Honkai: Star Rail",
  "com.miHoYo.bh3global": "Honkai Impact 3rd",
  "com.miHoYo.bh3oversea": "Honkai Impact 3rd",
  "com.HoYoverse.Nap": "Zenless Zone Zero",

  // ==================== Activision / Call of Duty ====================
  "com.activision.callofduty.shooter": "Call of Duty: Mobile",
  "com.activision.callofduty.warzone": "Call of Duty: Warzone Mobile",
  "com.garena.game.codm": "Call of Duty: Mobile (Garena)",

  // ==================== EA (Electronic Arts) ====================
  "com.ea.game.fifa6_row": "EA FC Mobile",
  "com.ea.gp.fifamobile": "EA FC Mobile",
  "com.ea.gp.apexlegendsmobilefps": "Apex Legends Mobile",
  "com.ea.games.simsfreeplay_row": "The Sims FreePlay",
  "com.ea.game.simsfreeplay_row": "The Sims FreePlay",
  "com.ea.game.pvzfree_row": "Plants vs Zombies FREE",
  "com.ea.game.pvz2_row": "Plants vs Zombies 2",
  "com.ea.games.nfs13_row": "Need for Speed Most Wanted",
  "com.ea.game.nfs14_row": "Need for Speed No Limits",
  "com.ea.games.r3_row": "Real Racing 3",

  // ==================== Riot Games ====================
  "com.riotgames.league.wildrift": "League of Legends: Wild Rift",
  "com.riotgames.league.teamfighttactics": "Teamfight Tactics",
  "com.riotgames.legendsofruneterra": "Legends of Runeterra",

  // ==================== Mojang / Microsoft ====================
  "com.mojang.minecraftpe": "Minecraft",
  "com.mojang.minecraftearth": "Minecraft Earth",
  "com.mojang.minecrafttrialpe": "Minecraft Trial",

  // ==================== Roblox ====================
  "com.roblox.client": "Roblox",

  // ==================== Niantic ====================
  "com.nianticlabs.pokemongo": "Pokemon GO",
  "com.nianticproject.pokemon.pokemonhome": "Pokemon HOME",
  "com.nianticlabs.pocketmonsters.pokemonhome": "Pokemon HOME",

  // ==================== Gameloft ====================
  "com.gameloft.android.ANMP.GloftA9HM": "Asphalt 9: Legends",
  "com.gameloft.android.ANMP.GloftA8HM": "Asphalt 8: Airborne",
  "com.gameloft.android.ANMP.GloftMCHM": "Modern Combat 5",
  "com.gameloft.android.ANMP.GloftM5HM": "Modern Combat 5",
  "com.gameloft.android.ANMP.GloftGGHM": "Gangstar Vegas",
  "com.gameloft.android.ANMP.GloftDMHM": "Dungeon Hunter 5",

  // ==================== Zynga ====================
  "com.zynga.words3": "Words With Friends 2",
  "com.zynga.livepoker": "Zynga Poker",
  "com.zynga.FarmVille2CountryEscape": "FarmVille 2: Country Escape",
  "com.zynga.crosswords": "Crosswords With Friends",
  "com.zynga.chess": "Chess With Friends",

  // ==================== Innersloth ====================
  "com.innersloth.spacemafia": "Among Us",

  // ==================== NetEase ====================
  "com.netease.mrzhna": "Identity V",
  "com.netease.g93na": "LifeAfter",
  "com.netease.hyxd.gb": "Naraka: Bladepoint",
  "com.netease.dwrg": "Diablo Immortal",
  "com.netease.pm": "Pokemon Unite",

  // ==================== Moon Active ====================
  "com.moonactive.coinmaster": "Coin Master",

  // ==================== Playrix ====================
  "com.playrix.gardenscapes": "Gardenscapes",
  "com.playrix.homescapes": "Homescapes",
  "com.playrix.township": "Township",
  "com.playrix.fishdom": "Fishdom",
  "com.playrix.manor": "Manor Matters",

  // ==================== Dream Games ====================
  "com.dreamgames.royalmatch": "Royal Match",

  // ==================== Peak Games ====================
  "com.peakgames.toonblast": "Toon Blast",
  "com.peakgames.toyblast": "Toy Blast",

  // ==================== Scopely ====================
  "com.scopely.monopolygo": "Monopoly GO!",
  "com.scopely.startrek": "Star Trek Fleet Command",

  // ==================== Subway Surfers / Kiloo ====================
  "com.kiloo.subwaysurf": "Subway Surfers",
  "com.kiloo.subwaysurfers": "Subway Surfers",

  // ==================== Outfit7 ====================
  "com.outfit7.mytalkingtom2": "My Talking Tom 2",
  "com.outfit7.talkingtom": "Talking Tom Cat",
  "com.outfit7.talkingtomgoldrun": "Talking Tom Gold Run",
  "com.outfit7.mytalkingtomfriends": "My Talking Tom Friends",
  "com.outfit7.mytalkingangelakw": "My Talking Angela 2",

  // ==================== Halfbrick ====================
  "com.halfbrick.fruitninjafree": "Fruit Ninja",
  "com.halfbrick.jetpackjoyride": "Jetpack Joyride",
  "com.halfbrick.jetpackjoyride2": "Jetpack Joyride 2",

  // ==================== Rovio (Angry Birds) ====================
  "com.rovio.angrybirds": "Angry Birds",
  "com.rovio.baba": "Angry Birds 2",
  "com.rovio.dream": "Angry Birds Dream Blast",
  "com.rovio.popcorn": "Angry Birds POP",
  "com.rovio.angrybirdsfriends": "Angry Birds Friends",
  "com.rovio.gold": "Angry Birds Reloaded",

  // ==================== Voodoo (Hyper-casual) ====================
  "io.voodoo.paper2": "Paper.io 2",
  "io.voodoo.paper3d": "Paper.io 3D",
  "com.ArmNomads.Parking": "Real Car Parking",
  "io.voodoo.helix": "Helix Jump",
  "io.voodoo.crowdcity": "Crowd City",
  "io.voodoo.snake": "Snake.io",
  "io.voodoo.hole": "Hole.io",

  // ==================== Ketchapp ====================
  "com.ketchapp.stack": "Stack",
  "com.ketchapp.ballz": "Ballz",
  "com.ketchapp.knife.hit": "Knife Hit",

  // ==================== Good Job Games ====================
  "com.ArtikGames.RunRace3D": "Run Race 3D",
  "com.ArtikGames.ColorRoad": "Color Road",

  // ==================== Lilith Games ====================
  "com.lilithgame.roc.gp": "Rise of Kingdoms",
  "com.lilithgames.afk.gp": "AFK Arena",
  "com.lilith.awakening.gp": "Dislyte",

  // ==================== IGG ====================
  "com.igg.android.lordsmobile": "Lords Mobile",
  "com.igg.castleclash": "Castle Clash",
  "com.igg.gof3": "Galaxy Online 3",

  // ==================== Netmarble ====================
  "com.netmarble.mherosgb": "Marvel Future Fight",
  "com.netmarble.revolutionglobal": "Marvel Future Revolution",
  "com.netmarble.nanagb": "The Seven Deadly Sins",
  "com.netmarble.kofg": "The King of Fighters ALLSTAR",

  // ==================== NCSOFT ====================
  "com.ncsoft.lineage2m": "Lineage 2M",
  "com.plaync.lineagew": "Lineage W",

  // ==================== Square Enix ====================
  "com.square_enix.android_googleplay.ffbe": "Final Fantasy Brave Exvius",
  "com.square_enix.ffbeww": "Final Fantasy Brave Exvius",
  "com.square_enix.ffxv_pocket_edition": "Final Fantasy XV Pocket Edition",
  "com.square_enix.android_googleplay.dissidia_oo": "Dissidia Final Fantasy Opera Omnia",
  "com.square_enix.dq8": "Dragon Quest VIII",

  // ==================== Bandai Namco ====================
  "com.bandainamcoent.dblegends_ww": "Dragon Ball Legends",
  "com.bandainamcoent.pacman256": "PAC-MAN 256",
  "com.bandainamcoent.dbzdokkan_ww": "Dragon Ball Z Dokkan Battle",
  "com.namcobandaigames.sprinting": "One Piece Bounty Rush",

  // ==================== Epic Games ====================
  "com.epicgames.fortnite": "Fortnite",

  // ==================== Blizzard ====================
  "com.blizzard.wtcg": "Hearthstone",
  "com.blizzard.diablo.immortal": "Diablo Immortal",

  // ==================== Krafton / BGMI ====================
  "com.pubg.imobile": "Battlegrounds Mobile India",

  // ==================== Garena ====================
  "com.dts.freefireth": "Free Fire",
  "com.dts.freefiremax": "Free Fire MAX",

  // ==================== SayGames / Hypercasual ====================
  "com.saygames.woodturning": "Woodturning",
  "com.azurgames.StackBall": "Stack Ball",

  // ==================== Lion Studios ====================
  "com.lionstudios.mrgun": "Mr Gun",
  "com.lionstudios.happyglass": "Happy Glass",

  // ==================== Miniclip ====================
  "com.miniclip.eightballpool": "8 Ball Pool",
  "com.miniclip.golfbattle": "Golf Battle",
  "com.miniclip.agar.io": "Agar.io",
  "com.miniclip.basketballstars": "Basketball Stars",

  // ==================== HOMA ====================
  "com.IEC.SkyRollers": "Sky Roller",

  // ==================== Other Popular Games ====================
  "com.fingersoft.hillclimb": "Hill Climb Racing",
  "com.fingersoft.hcr2": "Hill Climb Racing 2",
  "com.imangi.templerun2": "Temple Run 2",
  "com.imangi.templerun": "Temple Run",
  "com.disney.disneyplus": "Disney+", // Not a game, exclude pattern
  "com.yodo1.crossyroad": "Crossy Road",
  "com.devolver.reigns": "Reigns",
  "com.madfingergames.deadtrigger2": "Dead Trigger 2",
  "com.wb.goog.mkx": "Mortal Kombat",
  "com.wb.goog.injustice": "Injustice: Gods Among Us",
  "com.turner.cnplaylab": "Cartoon Network",
  "com.turner.btd6": "Bloons TD 6",
  "com.ninjakiwi.bloonstd6": "Bloons TD 6",
  "com.zeptolab.ctr.ads": "Cut the Rope",
  "com.zeptolab.ctr2.f2p": "Cut the Rope 2",
  "com.zeptolab.cats": "CATS: Crash Arena Turbo Stars",
  "com.feelingtouch.zf3d": "Zombie Frontier 3",
  "com.deemedyainc.solitaire": "Solitaire",
  "com.mobilityware.solitaire": "Solitaire",
  "com.me2zen.solitaire": "Solitaire Grand Harvest",
  "com.peoplefun.wordcross": "Wordscapes",
  "com.fugo.wow": "Words of Wonders",
  "com.BitMango.WordCookies": "Word Cookies",
  "com.Kabam.MarvelContest": "Marvel Contest of Champions",
  "com.kabam.marvelbattle": "Marvel Contest of Champions",
  "com.plarium.raidlegends": "RAID: Shadow Legends",
  "com.plarium.vikings": "Vikings: War of Clans",
  "com.frogmind.badland": "BADLAND",
  "com.frogmind.badland2": "BADLAND 2",
  "com.rusticlabs.archero": "Archero",
  "com.Supercent.IdleBigDevil": "Idle Big Devil",
  "com.sega.sonic1px": "Sonic the Hedgehog",
  "com.sega.sonic2.runner": "Sonic Dash 2",
  "com.sega.sonicforces": "Sonic Forces",
  "com.ubisoft.hungrysharkevolution": "Hungry Shark Evolution",
  "com.ubisoft.hungrysharkworld": "Hungry Shark World",
  "com.ubisoft.rayman.adventures": "Rayman Adventures",
  "com.yodo1.rodeo.stampede": "Rodeo Stampede",
  "com.gamevil.zenonia5.global": "Zenonia 5",
  "com.crazylabs.tricky.puzzle": "Tricky Puzzle",
  "com.tapinator.antsstory": "The Ants: Underground Kingdom",
  "com.firsttouchgames.smp": "Score! Match",
  "com.firsttouchgames.dls7": "Dream League Soccer",
  "com.firsttouchgames.dls2021": "Dream League Soccer 2021",
}

/**
 * Get the full package map from all sources.
 * Priority: User library > Custom mappings > Fallback
 *
 * @param userMappings - Custom package->name mappings from user settings
 * @param userLibraryGames - Games from user's sessionStore.games[]
 */
export function getGamePackageMap(
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): Map<string, string> {
  const libraryMappings: Record<string, string> = {}
  for (const game of userLibraryGames) {
    if (
      typeof game.packageName === "string" &&
      game.packageName.trim() !== ""
    ) {
      const pkg = game.packageName.trim()
      libraryMappings[pkg] = game.name
    }
  }

  const learnedMappings = getLearnedMappings()
  const communityMappings = getCommunityMappingsSync()

  return new Map([
    ...Object.entries(GAME_PACKAGES),
    ...communityMappings,
    ...Object.entries(learnedMappings),
    ...Object.entries(userMappings),
    ...Object.entries(libraryMappings),
  ])
}

/**
 * Check if a package name is in the known games list
 */
export function isKnownGame(
  packageName: string,
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): boolean {
  const packageMap = getGamePackageMap(userMappings, userLibraryGames)
  return packageMap.has(packageName)
}

/**
 * Get game name from package name
 */
export function getGameName(
  packageName: string,
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): string | null {
  const packageMap = getGamePackageMap(userMappings, userLibraryGames)
  return packageMap.get(packageName) || null
}

/**
 * Get all known package names from all sources
 */
export function getAllPackageNames(
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): string[] {
  const packageMap = getGamePackageMap(userMappings, userLibraryGames)
  return Array.from(packageMap.keys())
}

/**
 * Find package name by game name (inverse lookup)
 * Searches user library first, then custom mappings, then fallback
 */
export function findPackageNameByGameName(
  gameName: string,
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): string | undefined {
  const lowerName = gameName.toLowerCase()

  // Check user library first (most reliable)
  for (const game of userLibraryGames) {
    if (
      typeof game.packageName === "string" &&
      game.packageName.trim() !== "" &&
      game.name.toLowerCase() === lowerName
    ) {
      return game.packageName.trim()
    }
  }

  // Check custom mappings
  for (const [pkg, name] of Object.entries(userMappings)) {
    if (name.toLowerCase() === lowerName) {
      return pkg
    }
  }

  for (const [pkg, name] of Object.entries(GAME_PACKAGES)) {
    if (name.toLowerCase() === lowerName) {
      return pkg
    }
  }

  return undefined
}

const LEARNED_MAPPINGS_KEY = "mindful-gamer-learned-mappings"

const fuzzyMatchCache = new Map<string, RAWGGame | null>()

function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function calculateSimilarity(a: string, b: string): number {
  const aNorm = normalize(a)
  const bNorm = normalize(b)

  if (aNorm === bNorm) return 1
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) return 0.9

  const aWords = new Set(aNorm.split(" "))
  const bWords = new Set(bNorm.split(" "))
  const intersection = [...aWords].filter((w) => bWords.has(w))
  const union = new Set([...aWords, ...bWords])

  return intersection.length / union.size
}

export function getLearnedMappings(): Record<string, string> {
  try {
    const stored = localStorage.getItem(LEARNED_MAPPINGS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function saveLearnedMapping(
  packageName: string,
  gameName: string
): void {
  const current = getLearnedMappings()
  current[packageName] = gameName
  localStorage.setItem(LEARNED_MAPPINGS_KEY, JSON.stringify(current))
}

export async function fuzzyMatchRAWG(
  displayName: string,
  signal?: AbortSignal
): Promise<RAWGGame | null> {
  const cacheKey = normalize(displayName)
  if (fuzzyMatchCache.has(cacheKey)) {
    return fuzzyMatchCache.get(cacheKey) || null
  }

  try {
    const results = await searchGames(displayName, 5, signal)

    if (results.length === 0) {
      fuzzyMatchCache.set(cacheKey, null)
      return null
    }

    let bestMatch: RAWGGame | null = null
    let bestScore = 0

    for (const game of results) {
      const score = calculateSimilarity(displayName, game.name)
      if (score > bestScore && score >= 0.7) {
        bestMatch = game
        bestScore = score
      }
    }

    if (bestMatch && bestScore >= 0.7) {
      console.log(
        `[FuzzyMatch] "${displayName}" → "${bestMatch.name}" (score: ${bestScore.toFixed(2)})`
      )
      fuzzyMatchCache.set(cacheKey, bestMatch)
      return bestMatch
    }

    fuzzyMatchCache.set(cacheKey, null)
    return null
  } catch (error) {
    console.warn(`[FuzzyMatch] Failed for "${displayName}":`, error)
    return null
  }
}

export async function batchFuzzyMatchRAWG(
  apps: Array<{ packageName: string; displayName: string }>
): Promise<Map<string, RAWGGame>> {
  const results = new Map<string, RAWGGame>()
  const BATCH_SIZE = 3

  for (let i = 0; i < apps.length; i += BATCH_SIZE) {
    const batch = apps.slice(i, i + BATCH_SIZE)
    const promises = batch.map(async (app) => {
      const match = await fuzzyMatchRAWG(app.displayName)
      if (match) {
        results.set(app.packageName, match)
      }
    })
    await Promise.all(promises)
  }

  return results
}
