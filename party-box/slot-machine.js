// Simulated database of abilities
const abilityDatabase = [
"Draw a card, then discard a card.",
"Deal 2 damage to any target.",
"Add one mana of any color to your mana pool.",
"Create a 2/2 knight token with vigilance.",
"Put a +1/+1 counter on up to two target creatures.",
"Exile target nonland permanent.",
"Gain 5 life.",
"Draw three cards, then you may put a permanent card from your hand onto the battlefield.",
"Create a 1/1 white Soldier creature token.",
"Scry 2, then each opponent draws a card.",
"Exile the top three cards of your library. You may play them until end of turn.",
"You gain control of target creature with power 3 or less until end of turn. Untap that creature; it gains haste.",
"Target creature gets +2/+2 and flying until end of turn.",
"Target player gains an emblem with 'Whenever you cast a spell, lose 1 life.'",
"Create a 0/4 wall token with defender.",
"Exile all graveyards. Create a 5/5 black Zombie for each card exiled this way.",
"Flip a coin. If you win the flip, draw a card. If you lose, discard a card.",
"You may exchange control of target creature you control and target creature an opponent controls.",
"Tap target land. It doesn’t untap during its controller’s next untap step.",
"Create a 0/1 Goat token with deathtouch.",
"Each player discards their hand, then draws three cards.",
"Look at the top 10 cards of your library. Put one of them into your hand and exile the rest.",
"Take an extra turn after this one. Skip the untap step of that turn.",
"You may cast any number of spells from your hand without paying their mana costs.",
"Summon a 3/3 alpaca token.",
"Search your house for a snack. Gain life equal to the total sugar content.",
"Force an opponent to play with their cards upside down.",
"If you can juggle, create a 7/7 Clown token with trample.",
"Randomly select a card from your collection. Put it onto the battlefield.",
"Go outside and yell, 'I am the champion of the multiverse!' Gain an emblem with 'You cannot lose the game.'",
"Force an opponent to Google 'funny cat videos' and watch at least two.",
"Everyone at the table must swap seats every three turns.",
"Target player must recount their last three meals, in detail. If they can't remember, they lose 5 life.",
"Hire an actual lawyer to argue your case for the next rule dispute.",
"Walk into the nearest mirror. If you don’t pass through it, take 10 damage.",
"Reality warps. Everyone now plays as their favorite fictional character.",
"Rewrite the rules of Magic. You are now the creator. All games bow to your whims.",
"Deal 3 damage to any target.",  
"Counter target spell.",  
"Draw two cards.",  
"Destroy target artifact.",  
"Target creature gains +2/+2 until end of turn.",  
"Gain 5 life.",  
"Tap up to two target creatures.",  
"Exile target nonland permanent.",  
"Target player discards a card.",  
"Return target creature to its owner's hand",
"Scry 3, then draw a card.",
"Deal 2 damage to each creature.",  
"Target creature gains hexproof and indestructible until end of turn.",  
"Target creature gains deathtouch and lifelink until end of turn.",  
"Counter target noncreature spell.",  
"Exile target creature, then return it to the battlefield under its owner's control.",  
"Draw a card, then discard a card.",  
"Create two 1/1 white Soldier creature tokens.",  
"Exile target card from a graveyard.",  
"Target opponent mills four cards.", 
"Choose one: Destroy target enchantment, or destroy target artifact.",  
"Target creature you control fights target creature you don’t control.",  
"Draw a card for each creature you control with power 2 or less.",  
"Return target nonland permanent to its owner’s hand.",  
"Target creature gains +3/+3 until end of turn. Untap it.",  
"Deal 1 damage to any target. Draw a card.",  
"Exile all cards from target player's graveyard.",  
"Target player sacrifices a creature.",  
"Search your library for a land card, reveal it, then put it into your hand.",  
"Deal X damage divided as you choose among any number of targets, where X is the number of creatures you control.",
"Draw two cards, then exile a card from your hand.",  
"Destroy target creature with flying.",  
"Target creature gets -3/-3 until end of turn.",  
"Reveal the top three cards of your library. Put one into your hand and the rest on the bottom of your library.",  
"Counter target spell unless its controller pays 3.",  
"Target creature gets +1/+1 for each other creature you control.",  
"Sacrifice a creature. Draw cards equal to its power.",  
"Destroy target tapped creature.",  
"Put a +1/+1 counter on target creature and a loyalty counter on a Planeswalker you control.",  
"Untap all creatures you control. They gain vigilance until end of turn.",
"Prevent all combat damage that would be dealt this turn.",  
"Target creature gets -4/-0 until end of turn.",  
"All creatures get -1/-1 until end of turn.",  
"Gain control of target creature until end of turn. Untap that creature; it gains haste until end of turn.",  
"Counter target spell unless its controller discards a card.",  
"Target creature loses all abilities until end of turn.",  
"Target creature gains first strike and hexproof until end of turn.",  
"Exile target creature with power 4 or greater.",  
"Target creature gets +2/+0 and gains trample until end of turn.",  
"Create a Treasure token for each creature that died this turn.",
"Exile the top card of each player’s library. You may play those cards until end of turn.",  
"Counter target creature spell. Draw a card.",  
"Destroy all tapped creatures.",  
"Return all creatures to their owners' hands.",  
"Deal 2 damage to each opponent and gain 2 life.",  
"Put two target creatures on top of their owners’ libraries.",  
"Search your library for an instant or sorcery card, reveal it, then put it into your hand.",  
"Create a 3/3 green Beast creature token.",  
"Target creature gains protection from the color of your choice until end of turn.",  
"Deal 5 damage to any target.",
"Copy target instant or sorcery spell. You may choose new targets for the copy.",  
"Deal 1 damage to any target for each instant or sorcery in your graveyard.",  
"Sacrifice a creature. Deal damage equal to its power to any target.",  
"Exile target nonland permanent. Its controller creates a 3/3 colorless Golem token.",  
"Until end of turn, creatures you control gain 'Whenever this creature deals combat damage to a player, draw a card.'",  
"Return target creature or planeswalker card from your graveyard to your hand.",  
"Deal 4 damage to target creature, then scry 2.",  
"You gain 2 life for each artifact you control.",  
"Look at the top five cards of your library. Put one into your hand and exile the rest.",  
"Destroy target artifact or enchantment, then draw a card.", 
"Until end of turn, spells you cast cost 2 less to cast.",  
"Create a 1/1 colorless Thopter artifact creature token with flying for each card you’ve drawn this turn.",  
"Until end of turn, you may play lands from your graveyard.",  
"Exile target instant or sorcery spell. You may cast that spell as long as it remains exiled.",  
"Until end of turn, all creatures become artifacts in addition to their other types.",  
"Choose a number. Draw that many cards. At the beginning of the next end step, discard that many cards.",  
"Draw a card for each tapped creature target opponent controls.",  
"Until end of turn, whenever you tap a land for mana, add an additional mana of any type that land produced.",  
"Target creature phases out.",  
"Create a 2/2 black Zombie creature token for each noncreature card in your graveyard.",
"Exile the top card of your library. You may cast that card this turn. If you don’t, gain life equal to its mana value.",  
"Target opponent gains control of target nonland permanent you control. You draw three cards.",  
"Create a copy of target creature. That creature gains haste. Exile it at the beginning of the next end step.",  
"Exchange control of two target nonland permanents.",  
"Search your library for a basic land card and put it onto the battlefield tapped. If you control no other lands, untap it.",  
"Deal damage to target creature or planeswalker equal to the number of instants and sorceries in your graveyard.",  
"Return target instant or sorcery card from your graveyard to your hand.",  
"Create a 1/1 black Spirit creature token with flying for each creature that died this turn.",  
"Destroy target creature. Its controller gains life equal to its toughness.",  
"Look at the top X cards of your library, where X is the number of creatures you control. Put one into your hand and the rest on the bottom of your library.",
"Until end of turn, you may cast creature cards from your graveyard.",  
"Each player shuffles their hand into their library, then draws cards equal to the number of cards they shuffled in.",  
"Exile target creature. Its controller reveals the top card of their library. If it’s a creature card, put it onto the battlefield.",  
"Create a 4/4 red Dragon creature token with flying.",  
"Switch target creature’s power and toughness until end of turn.",  
"Until end of turn, you may cast spells without paying their mana costs.",  
"Destroy target land. Its controller creates a 0/1 green Plant creature token with defender.",  
"Target opponent reveals their hand. You choose a nonland card from it. Exile that card.",  
"Gain control of target planeswalker.",  
"You get an emblem with 'Whenever you cast a spell, scry 1.'",
"Destroy target creature.",  
"Draw three cards.",  
"Deal 4 damage to any target.",  
"Destroy target artifact or enchantment.",  
"Gain 7 life.",  
"Search your library for a land card and put it onto the battlefield tapped.",  
"Target player discards two cards.",  
"Exile target nonland permanent.",  
"Create three 1/1 white Soldier creature tokens.",  
"Return target creature card from your graveyard to your hand.",
"Each player sacrifices a creature.",  
"Target opponent mills ten cards.",  
"Exile the top five cards of your library. You may play those cards until the end of your next turn.",  
"Draw two cards, then discard a card.",  
"Deal X damage to each creature, where X is the number of lands you control.",  
"Destroy all creatures with power 3 or greater.",  
"Return target creature card from your graveyard to the battlefield.",  
"Each opponent loses 2 life. You gain life equal to the total life lost this way.",  
"Put a +1/+1 counter on each creature you control.",  
"Search your library for up to two basic lands, put them onto the battlefield tapped, then shuffle your library.",
"Draw a card for each creature you control.",  
"Return all creatures from your graveyard to your hand.",  
"Sacrifice any number of creatures. Create a 2/2 Zombie token for each creature sacrificed this way.",  
"Each player shuffles their graveyard into their library.",  
"Deal damage equal to the number of creatures you control to any target.",  
"Until end of turn, you may cast spells from your graveyard.",  
"Target player reveals their hand. You choose a nonland card from it. That player discards that card.",  
"Until end of turn, you may pay life equal to the mana value of a card you cast to draw a card.",  
"Destroy all creatures. For each creature destroyed this way, its controller loses 1 life.",  
"Create a copy of target creature. That creature gains haste until end of turn.",
"Create a 5/5 green Elemental creature token with trample.",  
"Choose one—Draw a card, or you gain 5 life.",  
"Until end of turn, you gain control of target creature.",  
"Return target creature to its owner's hand. If you do, draw a card.",  
"Create a Treasure token for each creature you control.",  
"Look at the top four cards of your library. Put one into your hand and the rest on the bottom of your library.",  
"Draw two cards and gain 2 life.",  
"Create an emblem with 'Whenever you cast a creature spell, draw a card.'",  
"Destroy target artifact. If that artifact was an Equipment, you may attach it to a creature you control.",  
"Each player draws a card for each creature they control." 


];

const cardNameElement = document.querySelector('.card-name');
const abilityElements = document.querySelectorAll('.card-text p');
const generateBtn = document.getElementById('generate-btn');
const abilityButtons = document.querySelectorAll('.ability-btn');

function getRandomAbilities() {
    const abilities = [];
    while (abilities.length < 3) {
        const randomIndex = Math.floor(Math.random() * abilityDatabase.length);
        if (!abilities.includes(abilityDatabase[randomIndex])) {
            abilities.push(abilityDatabase[randomIndex]);
        }
    }
    return abilities;
}

function updateCard() {
    const abilities = getRandomAbilities();
    cardNameElement.textContent = "Slot Machine";
    abilities.forEach((ability, index) => {
        abilityElements[index].textContent = `${index + 1}. ${ability}`;
    });
}

function useAbility(index) {
    const selectedAbility = abilityElements[index].textContent.slice(3);
    alert(`Using ability: ${selectedAbility}`);
    // Here you would implement the actual functionality of using the ability
}

generateBtn.addEventListener('click', updateCard);

abilityButtons.forEach(button => {
    button.addEventListener('click', () => {
        const index = parseInt(button.getAttribute('data-index'));
        useAbility(index);
    });
});

// Initial card generation
updateCard();