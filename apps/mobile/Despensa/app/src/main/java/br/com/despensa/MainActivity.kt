package br.com.despensa

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.hilt.navigation.compose.hiltViewModel
import br.com.despensa.presentation.economia.EconomiaScreen
import br.com.despensa.presentation.economia.EconomiaViewModel
import br.com.despensa.presentation.estoque.EstoqueScreen
import br.com.despensa.presentation.estoque.EstoqueViewModel
import br.com.despensa.presentation.lista.ListaScreen
import br.com.despensa.presentation.lista.ListaViewModel
import br.com.despensa.presentation.notif.PedidoPermissaoNotificacao
import br.com.despensa.presentation.theme.DespensaTheme
import br.com.despensa.presentation.theme.LimaNeon
import br.com.despensa.presentation.theme.UvaProfunda
import dagger.hilt.android.AndroidEntryPoint

private enum class Aba(val rotulo: String, val icone: ImageVector) {
    ESTOQUE("Estoque", Icons.Filled.Inventory),
    LISTA("Lista", Icons.Filled.ShoppingCart),
    ECONOMIA("R$", Icons.Filled.Savings)
}

@OptIn(ExperimentalMaterial3Api::class)
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            // Sprint 3: claro+escuro segue o sistema (US10 full com TalkBack vem na S4).
            DespensaTheme(escuro = isSystemInDarkTheme()) {
                // Sprint 2 (RF-002): rationale próprio + pedido do sistema na 1ª abertura.
                PedidoPermissaoNotificacao()
                var aba by rememberSaveable { mutableStateOf(Aba.ESTOQUE) }
                val vmEstoque: EstoqueViewModel = hiltViewModel()
                val itens by vmEstoque.itens.collectAsState()
                Scaffold(
                    topBar = {
                        TopAppBar(
                            title = {
                                Column(modifier = Modifier.fillMaxWidth()) {
                                    Text(
                                        when (aba) {
                                            Aba.ESTOQUE -> "Despensa"
                                            Aba.LISTA -> "Lista"
                                            Aba.ECONOMIA -> "R$"
                                        },
                                        style = MaterialTheme.typography.titleLarge.copy(
                                            fontWeight = FontWeight.Black
                                        ),
                                        color = LimaNeon
                                    )
                                    Text(
                                        when (aba) {
                                            Aba.ESTOQUE ->
                                                "${itens.size} ${if (itens.size == 1) "item" else "itens"} em estoque"
                                            Aba.LISTA -> "Exporte para o ListaCompras"
                                            Aba.ECONOMIA -> "Salvos vs perdidos no mês"
                                        },
                                        style = MaterialTheme.typography.labelMedium,
                                        color = MaterialTheme.colorScheme.onPrimaryContainer
                                    )
                                }
                            },
                            colors = TopAppBarDefaults.topAppBarColors(containerColor = UvaProfunda)
                        )
                    },
                    bottomBar = {
                        NavigationBar {
                            Aba.values().forEach { destino ->
                                NavigationBarItem(
                                    selected = aba == destino,
                                    onClick = { aba = destino },
                                    icon = {
                                        Icon(
                                            destino.icone,
                                            contentDescription = destino.rotulo
                                        )
                                    },
                                    label = { Text(destino.rotulo) },
                                    colors = NavigationBarItemDefaults.colors(
                                        selectedIconColor = LimaNeon,
                                        indicatorColor = UvaProfunda
                                    )
                                )
                            }
                        }
                    }
                ) { pad ->
                    Column(Modifier.padding(pad)) {
                        when (aba) {
                            Aba.ESTOQUE -> EstoqueScreen(vmEstoque)
                            Aba.LISTA -> {
                                val vmLista: ListaViewModel = hiltViewModel()
                                ListaScreen(vmLista)
                            }
                            Aba.ECONOMIA -> {
                                val vmEco: EconomiaViewModel = hiltViewModel()
                                EconomiaScreen(vmEco)
                            }
                        }
                    }
                }
            }
        }
    }
}
