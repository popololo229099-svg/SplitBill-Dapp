package com.splitbill.android.ui.navigation

import android.content.Context
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.splitbill.android.R
import com.splitbill.android.analytics.MixpanelTracker
import com.splitbill.android.data.WalletRepository
import com.splitbill.android.ui.screens.EventLogScreen
import com.splitbill.android.ui.screens.HistoryScreen
import com.splitbill.android.ui.screens.LandingScreen
import com.splitbill.android.ui.screens.SplitBillScreen
import com.splitbill.android.viewmodel.EventLogViewModel
import com.splitbill.android.viewmodel.HistoryViewModel
import com.splitbill.android.viewmodel.SplitBillViewModel
import com.splitbill.android.viewmodel.WalletViewModel

private data class Tab(val route: String, val label: String, val iconRes: Int)

@Composable
fun AppRoot() {
    val context: Context = androidx.compose.ui.platform.LocalContext.current.applicationContext

    val walletViewModel: WalletViewModel = viewModel {
        WalletViewModel(WalletRepository(context), MixpanelTracker(context))
    }
    val splitBillViewModel: SplitBillViewModel = viewModel {
        SplitBillViewModel(MixpanelTracker(context))
    }
    val historyViewModel: HistoryViewModel = viewModel {
        HistoryViewModel()
    }
    val eventLogViewModel: EventLogViewModel = viewModel {
        EventLogViewModel()
    }

    val walletState by walletViewModel.state.collectAsStateWithLifecycle()

    if (walletState.publicKey == null) {
        LandingScreen(walletViewModel = walletViewModel, onConnected = {})
    } else {
        AppNavHost(
            walletViewModel = walletViewModel,
            splitBillViewModel = splitBillViewModel,
            historyViewModel = historyViewModel,
            eventLogViewModel = eventLogViewModel
        )
    }
}

@Composable
fun AppNavHost(
    walletViewModel: WalletViewModel,
    splitBillViewModel: SplitBillViewModel,
    historyViewModel: HistoryViewModel,
    eventLogViewModel: EventLogViewModel
) {
    val navController = rememberNavController()
    val tabs = listOf(
        Tab("split_bill", "Split Bill", R.drawable.ic_split),
        Tab("history", "History", R.drawable.ic_history),
        Tab("event_log", "On-Chain", R.drawable.ic_blockchain)
    )

    Scaffold(
        bottomBar = {
            NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                tabs.forEach { tab ->
                    val selected = currentDestination?.hierarchy?.any { it.route == tab.route } == true
                    NavigationBarItem(
                        selected = selected,
                        onClick = {
                            navController.navigate(tab.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = {
                            Icon(
                                imageVector = ImageVector.vectorResource(tab.iconRes),
                                contentDescription = tab.label
                            )
                        },
                        label = { Text(tab.label, fontSize = 11.sp) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            indicatorColor = MaterialTheme.colorScheme.surfaceVariant,
                            unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                            unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Column(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            NavHost(
                navController = navController,
                startDestination = "split_bill"
            ) {
                composable("split_bill") {
                    SplitBillScreen(splitBillViewModel, walletViewModel)
                }
                composable("history") {
                    HistoryScreen(historyViewModel)
                }
                composable("event_log") {
                    EventLogScreen(eventLogViewModel)
                }
            }
        }
    }
}
